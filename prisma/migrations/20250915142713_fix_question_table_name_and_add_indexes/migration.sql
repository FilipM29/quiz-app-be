/*
  Warnings:

  - You are about to drop the `quiestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."answer_option" DROP CONSTRAINT "question_answer_option_fkey";

-- DropForeignKey
ALTER TABLE "public"."quiestion" DROP CONSTRAINT "question_quiz_round_fkey";

-- DropTable
DROP TABLE "public"."quiestion";

-- CreateTable
CREATE TABLE "public"."question" (
    "id" TEXT NOT NULL,
    "type" "public"."question_type" NOT NULL,
    "value" INTEGER NOT NULL,
    "picture_url" TEXT,
    "text" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "acceptableAnswers" TEXT[],
    "range" INTEGER,
    "roundId" TEXT NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_round_id_idx" ON "public"."question"("roundId");

-- CreateIndex
CREATE INDEX "question_type_idx" ON "public"."question"("type");

-- CreateIndex
CREATE INDEX "quiz_author_id_idx" ON "public"."quiz"("author_id");

-- CreateIndex
CREATE INDEX "quiz_status_visibility_idx" ON "public"."quiz"("quiz_status", "quiz_visibility");

-- CreateIndex
CREATE INDEX "quiz_created_at_idx" ON "public"."quiz"("created_at");

-- CreateIndex
CREATE INDEX "quiz_rating_idx" ON "public"."quiz"("rating");

-- CreateIndex
CREATE INDEX "quiz_round_quiz_id_idx" ON "public"."quiz_round"("quizId");

-- CreateIndex
CREATE INDEX "quiz_round_quiz_id_order_idx" ON "public"."quiz_round"("quizId", "order");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "user_created_at_idx" ON "public"."user"("created_at");

-- AddForeignKey
ALTER TABLE "public"."question" ADD CONSTRAINT "question_quiz_round_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."quiz_round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer_option" ADD CONSTRAINT "question_answer_option_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
