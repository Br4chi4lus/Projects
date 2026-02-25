import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ProjectsService } from '../../projects/projects.service';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../prisma.service';
import { ProjectUsersService } from '../../project-users/project-users.service';

@Injectable()
export class ParticipantGuard implements CanActivate {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectUserService: ProjectUsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    if (user.role.roleName === 'Admin') {
      return true;
    }

    const project = await this.projectsService.findOne(
      Number(request.params.projectId),
    );

    if (project.managerId == user.id) {
      return true;
    }

    const userProject = await this.projectUserService.findUserProject(
      project.id,
      user.id,
    );

    if (!userProject) {
      return false;
    }

    return true;
  }
}
