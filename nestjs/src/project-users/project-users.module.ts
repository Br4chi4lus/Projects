import { Module } from '@nestjs/common';
import { ProjectUsersController } from './project-users.controller';
import { ProjectUsersService } from './project-users.service';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [ProjectsModule, UsersModule, PermissionsModule],
  controllers: [ProjectUsersController],
  providers: [ProjectUsersService],
  exports: [ProjectUsersService],
})
export class ProjectUsersModule {}
