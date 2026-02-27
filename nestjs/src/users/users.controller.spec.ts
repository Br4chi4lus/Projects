import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { UserDTO } from './dtos/user.dto';
import { RoleEntity } from './entities/role.entity';
import { RoleDTO } from './dtos/role.dto';
import { PaginationQueryDto } from '../dtos/pagination.query.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let prismaService: PrismaService;
  let usersService: UsersService;

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
    usersService = new UsersService(prismaService);
    controller = new UsersController(usersService);
  });

  function createUserEntity(id: number) {
    return {
      id: id,
      email: 'test@test.com',
      passwordHash: '123456',
      firstName: 'name',
      lastName: 'name',
      dateOfBirth: new Date(),
      dateOfRegistration: new Date(),
      roleId: 1,
      role: {
        roleId: 1,
        role: 'name',
      } as unknown as RoleEntity,
    } as unknown as UserEntity;
  }

  describe('findAll', () => {
    // arrange
    const userIds = Array.from({ length: 10 }, (_, i) => i + 1);
    const paginationQueryDto = {
      pageSize: 5,
      pageNumber: 1,
    } as unknown as PaginationQueryDto;
    it('Should return an array of users and totalCount', async () => {
      const users = userIds
        .filter((id) => id <= paginationQueryDto.pageSize)
        .map((id) => createUserEntity(id));
      const date = new Date();
      jest
        .spyOn(usersService, 'findAll')
        .mockResolvedValueOnce([users, users.length]);

      // act
      const response = await controller.getUsers(paginationQueryDto);

      // assert
      expect(response.totalCount).toBe(paginationQueryDto.pageSize);
      expect(response.items.length).toBe(paginationQueryDto.pageSize);
    });

    it('Should return an empty array and count = 0', async () => {
      jest.spyOn(usersService, 'findAll').mockResolvedValueOnce([[], 0]);

      const response = await controller.getUsers(paginationQueryDto);

      expect(response.totalCount).toBe(0);
      expect(response.items.length).toBe(0);
    });
  });
});
