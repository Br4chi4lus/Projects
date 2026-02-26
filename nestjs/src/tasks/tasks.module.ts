import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ProjectUsersModule } from '../project-users/project-users.module';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [ProjectsModule, ProjectUsersModule, UsersModule, PermissionsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
