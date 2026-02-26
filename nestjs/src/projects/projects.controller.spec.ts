import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectEntity } from './entities/project.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../users/entities/role.entity';
import { StateOfProjectEntity } from './entities/state-of-project.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectService: ProjectsService;
  let prismaService: PrismaService;
  beforeEach(async () => {
    prismaService = new PrismaService();
    projectService = new ProjectsService(prismaService);
    controller = new ProjectsController(projectService);
  });

  describe('findAll', () => {
    it('Should return empty array', async () => {
      jest
        .spyOn(projectService, 'findAll')
        .mockImplementationOnce(() => Promise.resolve([]));

      const response = await controller.findAll();

      expect(response.length).toBe(0);
    });

    it('Should return array of projects', async () => {
      const project = new ProjectEntity(
        1,
        'name',
        'description',
        1,
        new UserEntity(
          1,
          'mail@mail.com',
          'name',
          'last name',
          new Date(),
          new Date(),
          'abc',
          1,
          new RoleEntity(1, 'Admin'),
        ),
        [],
        new Date(),
        new Date(),
        1,
        new StateOfProjectEntity(1, 'created'),
        [],
      );
      jest
        .spyOn(projectService, 'findAll')
        .mockImplementationOnce(() => Promise.resolve([project]));

      const response = await controller.findAll();

      expect(response.length).toBe(1);
      expect(response[0].name).toBe('name');
      expect(response[0].description).toBe('description');
      expect(response[0].manager.email).toBe('mail@mail.com');
      expect(response[0].manager.id).toBe(1);
    });
  });

  describe('findOne', () => {
    it('Should throw NotFoundException', async () => {
      jest
        .spyOn(projectService, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Project not found'));

      const response = controller.findOne(1);

      await expect(response).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Should return one project', async () => {
      const project = new ProjectEntity(
        1,
        'name',
        'description',
        1,
        new UserEntity(
          1,
          'mail@mail.com',
          'name',
          'last name',
          new Date(),
          new Date(),
          'abc',
          1,
          new RoleEntity(1, 'Admin'),
        ),
        [],
        new Date(),
        new Date(),
        1,
        new StateOfProjectEntity(1, 'created'),
        [],
      );
      jest
        .spyOn(projectService, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(project));

      const response = await controller.findOne(1);

      expect(response.id).toBe(project.id);
      expect(response.name).toBe(project.name);
      expect(response.manager.email).toBe(project.manager.email);
      expect(response.manager.id).toBe(project.manager.id);
      expect(response.tasks.length).toBe(project.tasks.length);
    });
  });

  describe('create', () => {
    it('Should return a new project', async () => {
      const project = new ProjectEntity(
        1,
        'name',
        'description',
        1,
        new UserEntity(
          1,
          'mail@mail.com',
          'name',
          'last name',
          new Date(),
          new Date(),
          'abc',
          1,
          new RoleEntity(1, 'Admin'),
        ),
        [],
        new Date(),
        new Date(),
        1,
        new StateOfProjectEntity(1, 'created'),
        [],
      );
      jest
        .spyOn(projectService, 'createProject')
        .mockImplementationOnce(() => Promise.resolve(project));
      const request = {
        user: {
          id: 1,
        },
      };
      const response = await controller.create(undefined, request);

      expect(response.id).toBe(project.id);
      expect(response.name).toBe(project.name);
      expect(response.manager.email).toBe(project.manager.email);
      expect(response.manager.id).toBe(project.manager.id);
      expect(response.tasks.length).toBe(project.tasks.length);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
