import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PermissionsService } from '../../permissions/permissions.service';

@Injectable()
export class ParticipantGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return await this.permissionsService.isParticipantOrOwnerOrAdmin(
      Number(request.params.projectId),
      user,
    );
  }
}
