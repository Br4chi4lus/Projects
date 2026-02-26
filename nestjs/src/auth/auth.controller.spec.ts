import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginUserDTO } from '../users/dtos/login.user.dto';
import { CreateUserDto } from '../users/dtos/create.user.dto';
import { jwtConstants } from '../users/constants';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;
  beforeEach(() => {
    jwtService = new JwtService();
    userService = new UsersService(new PrismaService());
    authService = new AuthService(userService, jwtService);
    controller = new AuthController(authService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('Should throw UnauthorizedException', async () => {
      jest
        .spyOn(authService, 'login')
        .mockRejectedValueOnce(
          new UnauthorizedException('Wrong email or password'),
        );
      const loginDto = new LoginUserDTO();
      loginDto.password = 'abc123';
      loginDto.email = 'test@email.com';

      const response = controller.login(loginDto);

      await expect(response).rejects.toThrow(UnauthorizedException);
    });

    it('Should return jwt', async () => {
      const expectedResponse = {
        access_token: 'abc123',
      };
      jest
        .spyOn(authService, 'login')
        .mockImplementationOnce(() => Promise.resolve(expectedResponse));
      const loginDto = new LoginUserDTO();
      loginDto.password = 'abc123';
      loginDto.email = 'test@email.com';

      const response = await controller.login(loginDto);

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('register', () => {
    it('Should throw BadRequestException', async () => {
      jest
        .spyOn(authService, 'register')
        .mockRejectedValueOnce(
          new BadRequestException('Passwords do not match'),
        );
      const createUserDto = new CreateUserDto();
      createUserDto.email = 'test@email.com';
      createUserDto.password = 'abc123';
      createUserDto.passwordConfirmation = 'abc12';
      createUserDto.dateOfBirth = new Date();
      createUserDto.firstName = 'Test';
      createUserDto.lastName = 'Test';

      const response = controller.register(createUserDto);

      await expect(response).rejects.toThrow(BadRequestException);
    });
  });
});
