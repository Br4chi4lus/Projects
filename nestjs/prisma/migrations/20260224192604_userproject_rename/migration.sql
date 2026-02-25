/*
  Warnings:

  - You are about to drop the `user_project` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_project" DROP CONSTRAINT "user_project_projectId_fkey";

-- DropForeignKey
ALTER TABLE "user_project" DROP CONSTRAINT "user_project_userId_fkey";

-- DropTable
DROP TABLE "user_project";

-- CreateTable
CREATE TABLE "userproject" (
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "userproject_pkey" PRIMARY KEY ("userId","projectId")
);

-- CreateIndex
CREATE INDEX "userproject_projectId_userId_idx" ON "userproject"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "userproject" ADD CONSTRAINT "userproject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userproject" ADD CONSTRAINT "userproject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
