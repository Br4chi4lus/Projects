import { UserProject } from '@prisma/client';

export class UserProjectEntity {
  userId: number;
  projectId: number;

  constructor(userId: number, projectId: number) {
    this.projectId = projectId;
    this.userId = userId;
  }

  public static fromModel(userProject: UserProject) {
    return new UserProjectEntity(userProject.userId, userProject.projectId);
  }
}
