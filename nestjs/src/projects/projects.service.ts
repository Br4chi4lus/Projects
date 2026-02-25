import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDTO } from './dtos/create.project.dto';
import { ProjectEntity } from './entities/project.entity';
import { StateOfProjectDTO } from './dtos/state-of-project.dto';
import { StateOfProjectEntity } from './entities/state-of-project.entity';
import { PaginationQueryDto } from '../dtos/pagination.query.dto';

@Injectable()
export class ProjectsService {
  constructor(private prismaService: PrismaService) {}
  // zmienic
  async createProject(dto: CreateProjectDTO, managerId: number) {
    try {
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
    } catch (error) {
      if (error.message.toLowerCase().includes('not found')) {
        throw new NotFoundException('Some users have not been found');
      } else {
        throw error;
      }
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
      if (error.message.toLowerCase().includes('not found')) {
        throw new NotFoundException('Project not found');
      } else throw error;
    }
  }

  public async updateDateOfModify(projectId: number) {
    const project = await this.prismaService.project.update({
      where: {
        id: projectId,
      },
      data: {
        dateOfModified: new Date(),
      },
    });
  }

  public async findAllStates() {
    const states = await this.prismaService.stateOfProject.findMany();

    return states.map((state) => StateOfProjectEntity.fromModel(state));
  }
}
