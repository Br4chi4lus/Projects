import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prismaService: PrismaService) {}

  public async isOwnerOrAdmin(projectId: number, user: any): Promise<boolean> {
    if (!user) return false;

    if (user.role.roleName === 'Admin') return true;

    const project = await this.prismaService.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) return false;

    return project.managerId === user.id;
  }

  public async isParticipantOrOwnerOrAdmin(
    projectId: number,
    user: any,
  ): Promise<boolean> {
    if (await this.isOwnerOrAdmin(projectId, user)) return true;

    if (!user) return false;

    const userId: number = user.id;

    const userProject = await this.prismaService.userProject.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!userProject) return false;

    return true;
  }
}
