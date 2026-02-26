import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { PrismaPromise } from '@prisma/client';
import { RoleEntity } from './entities/role.entity';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
    service = new UsersService(prismaService);
  });

  describe('findAll()', () => {
    it('Should return array of userEntity with one element', async () => {
      const date = new Date();
      const data = [
        {
          id: 1,
          email: 'abc@mail.com',
          firstName: 'tom',
          lastName: 'schulz',
          dateOfBirth: date,
          dateOfRegistration: date,
          passwordHash: 'abc',
          roleId: 1,
          role: {
            id: 1,
            role: 'Admin',
          },
        },
      ];
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockImplementationOnce(
          () => Promise.resolve(data) as PrismaPromise<typeof data>,
        );

      const response = await service.findAll();

      expect(response.length).toBe(1);
      expect(response).toEqual([
        new UserEntity(
          data[0].id,
          data[0].email,
          data[0].firstName,
          data[0].lastName,
          data[0].dateOfBirth,
          data[0].dateOfRegistration,
          data[0].passwordHash,
          data[0].roleId,
          new RoleEntity(data[0].role.id, data[0].role.role),
        ),
      ]);
    });
  });
});
