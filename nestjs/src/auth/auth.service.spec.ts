import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../users/entities/role.entity';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;
  beforeEach(async () => {
    jwtService = new JwtService();
    userService = new UsersService(new PrismaService());
    service = new AuthService(userService, jwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('Should throw UnauthorizedException ', async () => {
      const user = new UserEntity(
        1,
        'test@mail.com',
        'test',
        'test',
        new Date(),
        new Date(),
        'abc',
        1,
        new RoleEntity(1, 'Admin'),
      );
      jest
        .spyOn(userService, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(user));
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => false);

      const response = service.login('test@mail.com', 'abd');

      await expect(response).rejects.toThrow(UnauthorizedException);
    });

    it('Should return valid jwt ', async () => {
      const user = new UserEntity(
        1,
        'test@mail.com',
        'test',
        'test',
        new Date(),
        new Date(),
        'abc',
        1,
        new RoleEntity(1, 'Admin'),
      );
      const token = '123';
      jest
        .spyOn(userService, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(user));
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => true);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockImplementationOnce(() => Promise.resolve(token));
      const response = await service.login('test@mail.com', 'abd');

      expect(response).toEqual({ access_token: token });
    });
  });
  describe('register', () => {
    it('Should throw BadRequestException ', async () => {
      const response = service.register(
        'test@mail.com',
        'test',
        'test',
        new Date(),
        'abc',
        'abd',
      );

      await expect(response).rejects.toThrow(BadRequestException);
    });

    it('Should return UserEntity', async () => {
      const user = new UserEntity(
        1,
        'test@mail.com',
        'test',
        'test',
        new Date(),
        new Date(),
        'abc',
        1,
        new RoleEntity(1, 'Admin'),
      );
      jest
        .spyOn(userService, 'create')
        .mockImplementationOnce(() => Promise.resolve(user));
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(() => Promise.resolve(user.passwordHash));
      jest
        .spyOn(userService, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(undefined));

      const response = await service.register(
        user.email,
        user.firstName,
        user.lastName,
        user.dateOfBirth,
        'abc',
        'abc',
      );

      expect(response).toEqual(user);
    });
  });
  it('Should throw BadRequestException ', async () => {
    const user = new UserEntity(
      1,
      'test@mail.com',
      'test',
      'test',
      new Date(),
      new Date(),
      'abc',
      1,
      new RoleEntity(1, 'Admin'),
    );
    jest
      .spyOn(userService, 'findOne')
      .mockImplementationOnce(() => Promise.resolve(user));

    const response = service.register(
      user.email,
      'abc',
      'abc',
      new Date(),
      'abc',
      'abc',
    );

    await expect(response).rejects.toThrow(BadRequestException);
  });
});
