import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { UserEntity } from '../users/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../dtos/pagination.query.dto';
import { RoleEntity } from '../users/entities/role.entity';
import { UserProjectEntity } from './entities/user.project.entity';

@Injectable()
export class ProjectUsersService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  public async findAll(
    projectId: number,
    paginationQueryDto: PaginationQueryDto,
  ): Promise<[UserEntity[], number]> {
    const project = await this.projectsService.findOne(projectId);
    const skip =
      (paginationQueryDto.pageNumber - 1) * paginationQueryDto.pageSize;
    const take = paginationQueryDto.pageSize;

    if (!project) {
      throw new NotFoundException('Project not Found');
    }

    const [users, totalCount] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where: {
          userProject: {
            some: {
              projectId: projectId,
            },
          },
        },
        include: {
          role: true,
        },
        skip: skip,
        take: take,
      }),
      this.prismaService.user.count({
        where: {
          userProject: {
            some: {
              projectId: projectId,
            },
          },
        },
      }),
    ]);

    return [
      users.map(
        (user) =>
          new UserEntity(
            user.id,
            user.email,
            user.firstName,
            user.lastName,
            user.dateOfBirth,
            user.dateOfRegistration,
            user.passwordHash,
            user.roleId,
            new RoleEntity(user.role.id, user.role.role),
          ),
      ),
      totalCount,
    ];
  }

  public async findOne(projectId: number, userId: number): Promise<UserEntity> {
    const project = await this.projectsService.findOne(projectId);

    if (!project) {
      throw new NotFoundException('Project not Found');
    }

    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        userProject: {
          some: {
            projectId: projectId,
          },
        },
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found in project');
    }

    return UserEntity.fromModel(user);
  }

  public async addOne(projectId: number, userId: number): Promise<UserEntity> {
    const user = await this.usersService.findOneById(userId);
    const userProject = await this.findUserProject(projectId, userId);

    if (userProject) {
      throw new BadRequestException('User already exists in project');
    }

    await this.prismaService.userProject.create({
      data: {
        projectId: projectId,
        userId: userId,
      },
    });
    return user;
  }

  public async delete(projectId: number, userId: number): Promise<UserEntity> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not Found');
    }
    const project = await this.projectsService.findOne(projectId);
    if (!project) {
      throw new NotFoundException('Project not Found');
    }

    const userProject = await this.findUserProject(projectId, userId);
    if (!userProject) {
      throw new NotFoundException('User not Found in project');
    }

    await this.prismaService.userProject.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return user;
  }

  public async findUserProject(
    projectId: number,
    userId: number,
  ): Promise<UserProjectEntity | null> {
    const userProject = await this.prismaService.userProject.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
    return userProject ? UserProjectEntity.fromModel(userProject) : null;
  }
}
