import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ProjectsService } from '../../projects/projects.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private projectsService: ProjectsService) {}

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

    return false;
  }
}
