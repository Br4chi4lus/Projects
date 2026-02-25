import { PrismaService } from '../prisma.service';
import { UserEntity } from './entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleEntity } from './entities/role.entity';
import { PaginationQueryDto } from '../dtos/pagination.query.dto';
@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<[UserEntity[], number]> {
    const skip =
      (paginationQueryDto.pageNumber - 1) * paginationQueryDto.pageSize;
    const take = paginationQueryDto.pageSize;
    const [users, totalCount] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        include: {
          role: true,
        },
        skip: skip,
        take: take,
      }),
      this.prismaService.user.count(),
    ]);
    return [
      users.map(
        (user) =>
          new UserEntity(
            user.id,
            user.email,
            user.firstName,
            user.lastName,
            user.dateOfBirth,
            user.dateOfRegistration,
            user.passwordHash,
            user.roleId,
            new RoleEntity(user.role.id, user.role.role),
          ),
      ),
      totalCount,
    ];
  }

  async findOne(email: string): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
      include: {
        role: true,
      },
    });
    if (!user) {
      return undefined;
    }
    return UserEntity.fromModel(user);
  }

  async create(
    email: string,
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    passwordHash: string,
  ): Promise<UserEntity> {
    const user = await this.prismaService.user.create({
      data: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: new Date(dateOfBirth),
        passwordHash: passwordHash,
      },
      include: {
        role: true,
      },
    });
    return UserEntity.fromModel(user);
  }

  async updateRole(userId: number, role: string): Promise<UserEntity> {
    const roleReturn = await this.prismaService.role.findFirst({
      where: {
        role: {
          contains: role,
          mode: 'insensitive',
        },
      },
    });

    if (!roleReturn) {
      throw new NotFoundException('Role does not exist');
    }
    try {
      const user = await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          roleId: roleReturn.id,
        },
        include: {
          role: true,
        },
      });
      return UserEntity.fromModel(user);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException('User not found');
      } else {
        throw error;
      }
    }
  }

  async changePassword(
    passwordHash: string,
    userId: number,
  ): Promise<UserEntity> {
    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash: passwordHash,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return UserEntity.fromModel(user);
  }

  async findOneById(id: number): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return UserEntity.fromModel(user);
  }
}
