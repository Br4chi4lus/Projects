import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { UserDTO } from './dtos/user.dto';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dtos/create.user.dto';
import { LoginUserDTO } from './dtos/login.user.dto';
import { JwtService } from '@nestjs/jwt';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangeUserRoleDto } from './dtos/change.user.role.dto';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../dtos/pagination.query.dto';
import { PaginatedResultDto } from '../dtos/paginated.result.dto';

@Controller('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized user, insufficient credentials',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('Manager', 'Admin')
  @ApiOkResponse({ description: 'Returns all users' })
  @ApiQuery({ name: 'pageNumber', example: 1 })
  @ApiQuery({ name: 'pageSize', enum: [5, 10, 15, 25] })
  public async getUsers(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedResultDto<UserDTO>> {
    const [users, count] = await this.usersService.findAll(paginationQueryDto);
    const userDtos = users.map<UserDTO>((user) => UserDTO.fromEntity(user));
    return new PaginatedResultDto(userDtos, count);
  }

  @Put(':userId')
  @Roles('Admin')
  @ApiOkResponse({ description: 'Updated users role' })
  @ApiNotFoundResponse({ description: 'User/Role was not found' })
  public async updateRole(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Body() dto: ChangeUserRoleDto,
  ): Promise<UserDTO> {
    const user = await this.usersService.updateRole(userId, dto.newRole);

    return UserDTO.fromEntity(user);
  }
}
