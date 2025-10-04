-- CreateEnum
CREATE TYPE "public"."difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "public"."quiz" ADD COLUMN     "difficulty" "public"."difficulty" NOT NULL DEFAULT 'EASY';

-- CreateIndex
CREATE INDEX "quiz_difficulty_idx" ON "public"."quiz"("difficulty");
