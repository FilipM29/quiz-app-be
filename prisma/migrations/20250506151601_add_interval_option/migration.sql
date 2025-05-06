/*
  Warnings:

  - The values [FINISHED] on the enum `quiz_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `question_option` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "question_type" ADD VALUE 'INTERVAL';

-- AlterEnum
BEGIN;
CREATE TYPE "quiz_status_new" AS ENUM ('CONCEPT', 'PUBLISHED', 'ARCHIVED');
ALTER TABLE "quiz" ALTER COLUMN "quiz_status" TYPE "quiz_status_new" USING ("quiz_status"::text::"quiz_status_new");
ALTER TYPE "quiz_status" RENAME TO "quiz_status_old";
ALTER TYPE "quiz_status_new" RENAME TO "quiz_status";
DROP TYPE "quiz_status_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "question_option" DROP CONSTRAINT "question_question_option_fkey";

-- AlterTable
ALTER TABLE "quiestion" ADD COLUMN     "range" INTEGER;

-- DropTable
DROP TABLE "question_option";

-- CreateTable
CREATE TABLE "answer_option" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "answer_option_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "answer_option" ADD CONSTRAINT "question_answer_option_fkey" FOREIGN KEY ("questionId") REFERENCES "quiestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
