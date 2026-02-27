import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDTO } from './dtos/create.project.dto';
import { ProjectEntity } from './entities/project.entity';
import { StateOfProjectEntity } from './entities/state-of-project.entity';
import { PaginationQueryDto } from '../dtos/pagination.query.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ProjectsService {
  constructor(private prismaService: PrismaService) {}
  async createProject(dto: CreateProjectDTO, managerId: number) {
    const manager = await this.prismaService.user.findUnique({
      where: {
        id: managerId,
      },
    });

    if (!manager) {
      throw new NotFoundException('Manager not found.');
    }
    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: dto.userIds,
        },
      },
    });

    if (users.length != dto.userIds.length) {
      throw new NotFoundException('Some users do not exist.');
    }
    try{
      const project = await this.prismaService.project.create({
        data: {
          name: dto.name,
          description: dto.description,
          managerId: managerId,
        },
        include: {
          manager: {
            include: {
              role: true,
            },
          },
          state: true,
          tasks: {
            include: {
              user: {
                include: {
                  role: true,
                },
              },
              state: true,
            },
          },
        },
      });

      return ProjectEntity.fromModel(project);
    } catch (error){
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('Invalid relation');
      } else throw error;
    }

  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<[ProjectEntity[], number]> {
    const skip =
      (paginationQueryDto.pageNumber - 1) * paginationQueryDto.pageSize;
    const take = paginationQueryDto.pageSize;
    const [projects, totalCount] = await this.prismaService.$transaction([
      this.prismaService.project.findMany({
        include: {
          manager: {
            include: {
              role: true,
            },
          },
          state: true,
          tasks: {
            include: {
              user: {
                include: {
                  role: true,
                },
              },
              state: true,
            },
          },
        },
        take: take,
        skip: skip,
      }),
      this.prismaService.project.count(),
    ]);

    return [
      projects.map((project) => ProjectEntity.fromModel(project)),
      totalCount,
    ];
  }

  public async findOne(id: number): Promise<ProjectEntity> {
    const project = await this.prismaService.project.findUnique({
      where: {
        id: id,
      },
      include: {
        manager: {
          include: {
            role: true,
          },
        },
        state: true,
        tasks: {
          include: {
            user: {
              include: {
                role: true,
              },
            },
            state: true,
          },
        },
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return ProjectEntity.fromModel(project);
  }

  public async updateStateOfProject(
    projectId: number,
    state: string,
  ): Promise<ProjectEntity> {
    const stateReturn = await this.prismaService.stateOfProject.findFirst({
      where: {
        state: {
          contains: state,
          mode: 'insensitive',
        },
      },
    });

    if (!stateReturn) {
      throw new NotFoundException('State not found');
    }
    try {
      const project = await this.prismaService.project.update({
        where: {
          id: projectId,
        },
        data: {
          stateId: stateReturn.id,
        },
        include: {
          manager: {
            include: {
              role: true,
            },
          },
          state: true,
          tasks: {
            include: {
              user: {
                include: {
                  role: true,
                },
              },
              state: true,
            },
          },
        },
      });

      return ProjectEntity.fromModel(project);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Project not found');
      }
      throw error;
    }
  }

  public async updateDateOfModify(projectId: number) {
    try {
      const project = await this.prismaService.project.update({
        where: {
          id: projectId,
        },
        data: {
          dateOfModified: new Date(),
        },
      });
    } catch (error){
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Project not found');
      } else {
        throw error;
      }
    }
  }

  public async findAllStates() {
    const states = await this.prismaService.stateOfProject.findMany();

    return states.map((state) => StateOfProjectEntity.fromModel(state));
  }
}
