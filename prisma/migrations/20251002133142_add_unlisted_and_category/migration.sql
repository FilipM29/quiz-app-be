-- CreateEnum
CREATE TYPE "public"."category" AS ENUM ('SPORT', 'GEOGRAPHY', 'SCIENCE', 'HISTORY', 'POP_CULTURE', 'ENTERTAINMENT', 'TECHNOLOGY', 'LITERATURE', 'FOOD', 'BUSINESS', 'HEALTH', 'NATURE', 'MATHEMATICS', 'LANGUAGES', 'CURRENT_EVENTS', 'OTHER');

-- AlterEnum
ALTER TYPE "public"."quiz_visibility" ADD VALUE 'UNLISTED';

-- AlterTable
ALTER TABLE "public"."quiz" ADD COLUMN     "category" "public"."category" NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "quiz_category_idx" ON "public"."quiz"("category");

-- CreateIndex
CREATE INDEX "quiz_category_status_visibility_idx" ON "public"."quiz"("category", "quiz_status", "quiz_visibility");
