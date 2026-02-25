/*
  Warnings:

  - You are about to drop the `_developedBy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_developedBy" DROP CONSTRAINT "_developedBy_A_fkey";

-- DropForeignKey
ALTER TABLE "_developedBy" DROP CONSTRAINT "_developedBy_B_fkey";

-- DropTable
DROP TABLE "_developedBy";

-- CreateTable
CREATE TABLE "user_project" (
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "user_project_pkey" PRIMARY KEY ("userId","projectId")
);

-- CreateIndex
CREATE INDEX "user_project_projectId_userId_idx" ON "user_project"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "user_project" ADD CONSTRAINT "user_project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_project" ADD CONSTRAINT "user_project_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
