import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectEntity } from './entities/project.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../users/entities/role.entity';
import { StateOfProjectEntity } from './entities/state-of-project.entity';
import { NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../dtos/pagination.query.dto';
import { ProjectDTO } from './dtos/project.dto';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectService: ProjectsService;
  beforeEach(async () => {
    projectService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      createProject: jest.fn(),
    } as unknown as ProjectsService;
    controller = new ProjectsController(projectService);
  });

  function compareProjectAndResponse(
    project: ProjectEntity,
    response: ProjectDTO,
  ) {
    expect(project.id).toBe(response.id);
    expect(response.name).toBe(project.name);
    expect(response.description).toBe(project.description);
    expect(response.manager.email).toBe(project.manager.email);
    expect(response.manager.id).toBe(project.manager.id);
  }

  describe('findAll', () => {
    it('Should return dto with empty array and count = 0', async () => {
      // arrange
      jest
        .spyOn(projectService, 'findAll')
        .mockImplementationOnce(() => Promise.resolve([[], 0]));
      const dto = new PaginationQueryDto();
      dto.pageSize = 5;
      dto.pageNumber = 1;

      // act
      const response = await controller.findAll(dto);

      // assert
      expect(response.totalCount).toBe(0);
      expect(response.items.length).toBe(0);
    });

    it('Should return dto with array of projects and count', async () => {
      // arrange
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
        new Date(),
        new Date(),
        1,
        new StateOfProjectEntity(1, 'created'),
        [],
      );
      jest
        .spyOn(projectService, 'findAll')
        .mockImplementationOnce(() => Promise.resolve([[project], 1]));

      const dto = new PaginationQueryDto();
      dto.pageSize = 5;
      dto.pageNumber = 1;

      // act
      const response = await controller.findAll(dto);

      // assert
      expect(response.totalCount).toBe(1);
      compareProjectAndResponse(project, response.items[0]);
    });
  });

  describe('findOne', () => {
    // arrange
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
        new Date(),
        new Date(),
        1,
        new StateOfProjectEntity(1, 'created'),
        [],
      );
      jest
        .spyOn(projectService, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(project));

      // act
      const response = await controller.findOne(1);

      // assert
      compareProjectAndResponse(project, response);
    });
  });

  describe('create', () => {
    // arrange
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
      const dto = undefined as any;

      // act
      const response = await controller.create(dto, request);

      // assert
      compareProjectAndResponse(project, response);
    });
  });
});
