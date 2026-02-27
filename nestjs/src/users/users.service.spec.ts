import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { PrismaPromise, Role, User } from '@prisma/client';
import { RoleEntity } from './entities/role.entity';
import { PaginationQueryDto } from '../dtos/pagination.query.dto';
import { NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = {
      $transaction: jest.fn(),
      user: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findFirst: jest.fn(),
      },
    } as unknown as PrismaService;
    service = new UsersService(prismaService);
  });

  const date = new Date();

  function createOneUser(id: number, email: string): User {
    return {
      id: id,
      email: email,
      firstName: 'name',
      lastName: 'last name',
      dateOfBirth: date,
      dateOfRegistration: date,
      passwordHash: 'abc',
      roleId: 1,
      role: {
        id: 1,
        role: 'Admin',
      },
    } as unknown as User;
  }

  describe('findAll()', () => {
    it('Should return a list of users and total count', async () => {
      // arrange
      const userIds = Array.from({ length: 10 }, (_, i) => i + 1);
      const paginationQueryDto = {
        pageSize: 5,
        pageNumber: 1,
      } as PaginationQueryDto;
      const data = userIds.map((id) => createOneUser(id, 'email@mail.com'));
      jest
        .spyOn(prismaService, '$transaction')
        .mockResolvedValueOnce([
          data.filter((user) => user.id <= paginationQueryDto.pageSize),
          data.length,
        ]);

      // act
      const [resultUsers, resultCount] =
        await service.findAll(paginationQueryDto);

      // assert
      expect(resultUsers.length).toBe(paginationQueryDto.pageSize);
      expect(resultCount).toBe(data.length);
    });
  });

  describe('findOne()', () => {
    it('Should return one user', async () => {
      // arrange
      const email = 'email';
      const user = createOneUser(1, email);

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(user);
      // act
      const result = await service.findOne(email);

      // assert

      expect(result.email).toBe(user.email);
      expect(result.id).toBe(user.id);
    });

    it('Should throw NotFoundException', async () => {
      // arrange
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      // act
      const result = service.findOne('a');

      // assert
      await expect(result).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateRole()', () => {
    const userId = 1;
    const role = 'Admin';

    it('Should throw NotFoundException Role not found', async () => {
      // arrange
      jest.spyOn(prismaService.role, 'findFirst').mockResolvedValueOnce(null);

      // act
      const result = service.updateRole(userId, role);

      // assert
      await expect(result).rejects.toThrow(
        new NotFoundException('Role not found'),
      );
    });

    it('Should throw NotFoundException User not found', async () => {
      // arrange
      const prismaException = new PrismaClientKnownRequestError(
        'User not found',
        {
          code: 'P2025',
          clientVersion: 'test',
        },
      );
      jest
        .spyOn(prismaService.role, 'findFirst')
        .mockResolvedValueOnce({ id: 1, role: 'Admin' } as unknown as Role);
      jest
        .spyOn(prismaService.user, 'update')
        .mockRejectedValueOnce(prismaException);

      // act
      const result = service.updateRole(userId, role);

      // assert
      await expect(result).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });
});
