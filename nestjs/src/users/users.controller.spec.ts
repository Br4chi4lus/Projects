import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { UserDTO } from './dtos/user.dto';
import { RoleEntity } from './entities/role.entity';
import { RoleDTO } from './dtos/role.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let prismaService: PrismaService;
  let usersService: UsersService;

  beforeEach(() => {
    prismaService = new PrismaService();
    usersService = new UsersService(prismaService);
    controller = new UsersController(usersService);
  });

  describe('findAll', () => {
    it('Should return an array of users(with one element)', async () => {
      const date = new Date();
      jest
        .spyOn(usersService, 'findAll')
        .mockImplementationOnce(() =>
          Promise.resolve([
            new UserEntity(
              1,
              'abc@example.com',
              'john',
              'doe',
              date,
              date,
              'abc',
              1,
              new RoleEntity(1, 'Admin'),
            ),
          ]),
        );

      const response = await controller.getUsers();

      expect(response.length).toBe(1);
      expect(response[0]).toEqual(
        new UserDTO(
          1,
          'abc@example.com',
          'john',
          'doe',
          date,
          new RoleDTO('Admin'),
        ),
      );
    });

    it('Should return an empty array', async () => {
      jest
        .spyOn(usersService, 'findAll')
        .mockImplementationOnce(() => Promise.resolve([]));

      const response = await controller.getUsers();

      expect(response.length).toBe(0);
    });
  });
});
