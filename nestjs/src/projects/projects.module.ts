import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma.service';
import { ProjectUsersService } from '../project-users/project-users.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    PrismaService,
    ProjectUsersService,
    UsersService,
  ],
})
export class ProjectsModule {}
