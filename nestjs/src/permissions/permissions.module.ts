import { forwardRef, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ProjectsService } from '../projects/projects.service';
import { ProjectUsersService } from '../project-users/project-users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ProjectsModule } from '../projects/projects.module';
import { ProjectUsersModule } from '../project-users/project-users.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
