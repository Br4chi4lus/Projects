import { UserDTO } from '../../users/dtos/user.dto';
import { ProjectEntity } from '../entities/project.entity';
import { StateOfProjectDTO } from './state-of-project.dto';
import { TaskDTO } from '../../tasks/dtos/task.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  manager: UserDTO;
  @ApiProperty()
  state: StateOfProjectDTO;
  @ApiProperty()
  dateOfCreation: Date;
  @ApiProperty()
  dateOfModified: Date;
  @ApiProperty({ type: [TaskDTO] })
  tasks: TaskDTO[];

  constructor(
    id: number,
    name: string,
    description: string,
    manager: UserDTO,
    state: StateOfProjectDTO,
    dateOfCreation: Date,
    dateOfModified: Date,
    tasks: TaskDTO[],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.manager = manager;
    this.state = state;
    this.dateOfCreation = dateOfCreation;
    this.dateOfModified = dateOfModified;
    this.tasks = tasks;
  }

  public static fromEntity(projectEntity: ProjectEntity): ProjectDTO {
    return new ProjectDTO(
      projectEntity.id,
      projectEntity.name,
      projectEntity.description,
      UserDTO.fromEntity(projectEntity.manager),
      projectEntity.state,
      projectEntity.dateOfCreation,
      projectEntity.dateOfModified,
      projectEntity.tasks.map((task) => TaskDTO.fromEntity(task)),
    );
  }
}
