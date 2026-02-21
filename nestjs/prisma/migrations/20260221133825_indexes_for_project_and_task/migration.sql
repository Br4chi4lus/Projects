-- CreateIndex
CREATE INDEX "project_managerId_idx" ON "project"("managerId");

-- CreateIndex
CREATE INDEX "task_projectId_idx" ON "task"("projectId");

-- CreateIndex
CREATE INDEX "task_userId_idx" ON "task"("userId");
