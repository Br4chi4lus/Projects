import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDTO } from './dtos/create.task.dto';

import { TaskEntity } from './entities/task.entity';
import { ProjectUsersService } from '../project-users/project-users.service';
import { PaginationQueryDto } from '../dtos/pagination.query.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class TasksService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly projectService: ProjectsService,
    private readonly projectUsersService: ProjectUsersService,
  ) {}

  public async getTasks(
    projectId: number,
    paginationQueryDto: PaginationQueryDto,
  ): Promise<[TaskEntity[], number]> {
    const project = await this.projectService.findOne(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const skip =
      (paginationQueryDto.pageNumber - 1) * paginationQueryDto.pageSize;
    const take = paginationQueryDto.pageSize;
    const [tasks, count] = await this.prismaService.$transaction([
      this.prismaService.task.findMany({
        where: {
          projectId: projectId,
        },
        include: {
          user: {
            include: {
              role: true,
            },
          },
          state: true,
        },
        skip: skip,
        take: take,
      }),
      this.prismaService.task.count({
        where: {
          projectId: projectId,
        },
      }),
    ]);

    return [tasks.map((task) => TaskEntity.fromModel(task)), count];
  }

  public async getTaskById(
    projectId: number,
    taskId: number,
  ): Promise<TaskEntity> {
    const task = await this.prismaService.task.findFirst({
      where: {
        AND: [
          {
            projectId: projectId,
          },
          {
            id: taskId,
          },
        ],
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
        state: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return TaskEntity.fromModel(task);
  }

  public async createTask(
    createTaskDto: CreateTaskDTO,
    projectId: number,
  ): Promise<TaskEntity> {
    try {
      const user = await this.projectUsersService.findOne(
        projectId,
        createTaskDto.userId,
      );

      if (!user) throw new NotFoundException('User not found');

      const [task, project] = await this.prismaService.$transaction([
        this.prismaService.task.create({
          data: {
            name: createTaskDto.name,
            description: createTaskDto.description,
            userId: createTaskDto.userId,
            projectId: projectId,
          },
          include: {
            user: {
              include: {
                role: true,
              },
            },
            state: true,
          },
        }),
        this.prismaService.project.update({
          where: {
            id: projectId,
          },
          data: {
            dateOfModified: new Date(),
          }
        }),
      ]);

      return TaskEntity.fromModel(task);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003'){
        throw new BadRequestException('Invalid relation');
      } else {
        throw error;
      }
    }
  }

  public async deleteTask(
    projectId: number,
    taskId: number,
  ): Promise<TaskEntity> {
    try {
      const deletedTask = await this.prismaService.task.delete({
        where: {
          id: taskId,
        },
        include: {
          user: {
            include: {
              role: true,
            },
          },
          state: true,
        },
      });

      return TaskEntity.fromModel(deletedTask);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError && error.code === 'P2025'
      ) {
        throw new NotFoundException('Project not found');
      } else if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('Foreign key constraint');
      } else {
        throw error;
      }
    }
  }

  public async updateStateOfTask(
    projectId: number,
    taskId: number,
    state: string,
  ): Promise<TaskEntity> {
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
      const task = await this.prismaService.task.update({
        where: {
          projectId: projectId,
          id: taskId,
        },
        data: {
          stateId: stateReturn.id,
        },
        include: {
          user: {
            include: {
              role: true,
            },
          },
          state: true,
        },
      });

      return TaskEntity.fromModel(task);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Task not found');
      } else throw error;
    }
  }
}
