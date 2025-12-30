/*
  Warnings:

  - You are about to drop the column `isUnlocked` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `patrimonialLanguageId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `isUnlocked` on the `Level` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `Level` table. All the data in the column will be lost.
  - Added the required column `levelId` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patrimonialLanguageId` to the `Level` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_patrimonialLanguageId_fkey";

-- DropForeignKey
ALTER TABLE "Level" DROP CONSTRAINT "Level_lessonId_fkey";

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "lessonId" TEXT;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "isUnlocked",
DROP COLUMN "patrimonialLanguageId",
ADD COLUMN     "contentUrl" TEXT,
ADD COLUMN     "levelId" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Level" DROP COLUMN "isUnlocked",
DROP COLUMN "lessonId",
ADD COLUMN     "patrimonialLanguageId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "accessoryId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "options" TEXT[],
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_userId_key" ON "Avatar"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_lessonId_key" ON "UserProgress"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "Level_patrimonialLanguageId_fkey" FOREIGN KEY ("patrimonialLanguageId") REFERENCES "PatrimonialLanguage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
