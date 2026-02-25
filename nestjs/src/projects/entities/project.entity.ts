import { UserEntity } from '../../users/entities/user.entity';
import { Project, Role, StateOfProject, Task, User } from '@prisma/client';
import { StateOfProjectEntity } from './state-of-project.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';

export class ProjectEntity {
  id: number;
  name: string;
  description: string;
  managerId: number;
  manager: UserEntity;
  dateOfCreation: Date;
  dateOfModified: Date;
  stateId: number;
  state: StateOfProjectEntity;
  tasks: TaskEntity[];

  constructor(
    id: number,
    name: string,
    description: string,
    managerId: number,
    manager: UserEntity,
    dateOfCreation: Date,
    dateOfModified: Date,
    stateId: number,
    state: StateOfProjectEntity,
    tasks: TaskEntity[],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.managerId = managerId;
    this.manager = manager;
    this.dateOfCreation = dateOfCreation;
    this.dateOfModified = dateOfModified;
    this.stateId = stateId;
    this.state = state;
    this.tasks = tasks;
  }

  public static fromModel(
    model: Project & { manager: User & { role: Role } } & {
      state: StateOfProject;
    } & {
      tasks: (Task & { user: User & { role: Role } } & {
        state: StateOfProjectEntity;
      })[];
    },
  ): ProjectEntity {
    return new ProjectEntity(
      model.id,
      model.name,
      model.description,
      model.managerId,
      UserEntity.fromModel(model.manager),
      model.dateOfCreation,
      model.dateOfModified,
      model.stateId,
      StateOfProjectEntity.fromModel(model.state),
      model.tasks.map((task) => TaskEntity.fromModel(task)),
    );
  }
}
