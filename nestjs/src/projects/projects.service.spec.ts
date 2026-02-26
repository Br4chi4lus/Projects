import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDTO } from './dtos/create.project.dto';
import {
  Prisma,
  Project,
  Role,
  StateOfProject,
  User,
  UserProject,
} from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../dtos/pagination.query.dto';

describe('ProjectsService', () => {
  let prismaService: PrismaService;
  let service: ProjectsService;

  beforeEach(async () => {
    prismaService = {
      $transaction: jest.fn(),
      project: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      stateOfProject: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;
    service = new ProjectsService(prismaService);
  });

  function createProject(id: number): Project {
    const date = new Date();
    return {
      id: id,
      name: 'test',
      description: 'description',
      dateOfCreation: date,
      dateOfModified: date,
      managerId: id,
      manager: {
        id: id,
        roleId: 1,
        role: {
          id: 1,
          name: 'test',
        } as unknown as Role,
      } as unknown as User,
      stateId: 1,
      state: { id: 1 } as unknown as StateOfProject,
      tasks: [],
    } as unknown as Project;
  }

  describe('createProject', () => {
    const dto = {
      name: 'test',
      description: 'description',
      userIds: [1, 3],
    } as unknown as CreateProjectDTO;

    const managerId = 1;
    const date = new Date();
    const projectId = 1;

    const users = dto.userIds.map((id) => ({ id: id }) as unknown as User);

    it('Should create a new project and return ProjectEntity', async () => {
      // arrange
      const project = {
        id: projectId,
        name: dto.name,
        description: dto.description,
        managerId: managerId,
        manager: {
          id: managerId,
          roleId: 1,
          role: {
            id: 1,
            name: 'test',
          },
        } as unknown as User,
        dateOfCreation: date,
        dateOfModified: date,
        stateId: 1,
        state: { id: 1 } as unknown as StateOfProject,
        tasks: [],
        userProject: dto.userIds.map(
          (id) =>
            ({ userId: id, projectId: projectId }) as unknown as UserProject,
        ),
      } as unknown as Project;

      jest
        .spyOn(prismaService.project, 'create')
        .mockResolvedValueOnce(project);

      jest.spyOn(prismaService.user, 'findMany').mockResolvedValueOnce(users);
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(users[0]);

      // act
      const result = await service.createProject(dto, managerId);

      // assert
      expect(result.id).toBe(projectId);
      expect(result.name).toBe(project.name);
    });

    it('Should throw NotFoundException when manager does not exist', async () => {
      // arrange
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      // act
      const result = service.createProject(dto, managerId);

      // assert
      await expect(result).rejects.toThrow(
        new NotFoundException('Manager not found.'),
      );
    });

    it('Should throw NotFoundException when some users do not exist', async () => {
      // arrange
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(users[0]);
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValueOnce([users[0]]);

      // act
      const result = service.createProject(dto, managerId);

      // assert
      await expect(result).rejects.toThrow(
        new NotFoundException('Some users do not exist.'),
      );
    });
  });

  describe('findAll', () => {
    const projectIds = Array.from({ length: 10 }, (_, i) => i + 1);
    const paginationQueryDto = {
      pageSize: 5,
      pageNumber: 1,
    } as unknown as PaginationQueryDto;
    const date = new Date();
    it('Should return a list of projects and total count', async () => {
      const filteredProjectIds = projectIds.filter(
        (id) => id <= paginationQueryDto.pageSize,
      );
      const projects = filteredProjectIds.map((id) => createProject(id));
      jest
        .spyOn(prismaService, '$transaction')
        .mockResolvedValueOnce([projects, projectIds.length]);

      // act
      const [resultProjects, resultCount] =
        await service.findAll(paginationQueryDto);

      // assert
      expect(resultCount).toBe(projectIds.length);
      expect(resultProjects.length).toBe(paginationQueryDto.pageSize);
    });
  });

  describe('findOne', () => {
    const id = 1;
    it('Should return project entity with given id', async () => {
      // arrange
      const project = createProject(id);
      jest
        .spyOn(prismaService.project, 'findUnique')
        .mockResolvedValueOnce(project);

      // act
      const result = await service.findOne(id);

      // assert
      expect(result.id).toBe(project.id);
      expect(result.name).toBe(project.name);
      expect(result.description).toBe(project.description);
    });

    it('Should throw NotFoundException', async () => {
      // arrange
      jest
        .spyOn(prismaService.project, 'findUnique')
        .mockResolvedValueOnce(null);

      const result = service.findOne(id);

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateStateOfProject', () => {
    it('Should update state of project and return updated project', async () => {
      // arrange
      const id = 1;
      const project = createProject(id);
      const newStateId = 2;
      project.stateId = newStateId;

      jest
        .spyOn(prismaService.stateOfProject, 'findFirst')
        .mockResolvedValueOnce({ id: newStateId } as unknown as StateOfProject);
      jest
        .spyOn(prismaService.project, 'update')
        .mockResolvedValueOnce(project);

      // act
      const result = await service.updateStateOfProject(id, 'state');

      expect(result.id).toBe(id);
    });

    it('Should throw NotFoundException for stateOfProject', async () => {
      // arrange
      const id = 1;
      jest
        .spyOn(prismaService.stateOfProject, 'findFirst')
        .mockResolvedValueOnce(null);

      // act
      const result = service.updateStateOfProject(id, 'state');

      // assert
      await expect(result).rejects.toThrow(
        new NotFoundException('State not found'),
      );
    });

    it('Should throw NotFoundException for project', async () => {
      // arrange
      const prismaNotFoundException = new Prisma.PrismaClientKnownRequestError(
        'Project not found',
        {
          code: 'P2025',
          clientVersion: '',
        },
      );
      const id = 1;
      jest
        .spyOn(prismaService.stateOfProject, 'findFirst')
        .mockResolvedValueOnce({ id: 1 } as unknown as StateOfProject);
      jest
        .spyOn(prismaService.project, 'update')
        .mockRejectedValueOnce(prismaNotFoundException);

      // act
      const result = service.updateStateOfProject(id, 'state');

      await expect(result).rejects.toThrow(
        new NotFoundException('Project not found'),
      );
    });
  });
});
