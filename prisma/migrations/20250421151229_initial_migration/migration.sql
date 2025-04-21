-- CreateEnum
CREATE TYPE "quiz_type" AS ENUM ('SLIDES', 'JEOPARDY');

-- CreateEnum
CREATE TYPE "play_type" AS ENUM ('SINGLE_ONLINE', 'SINGLE_OFFLINE', 'MULTI_ONLINE', 'MULTI_OFFLINE');

-- CreateEnum
CREATE TYPE "quiz_result" AS ENUM ('FINISHED', 'UNFINISHED');

-- CreateEnum
CREATE TYPE "quiz_status" AS ENUM ('CONCEPT', 'FINISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "quiz_visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('EXACT', 'OPTIONS');

-- CreateEnum
CREATE TYPE "role" AS ENUM ('REGULAR', 'ADMIN');

-- CreateTable
CREATE TABLE "quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "picture_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "quiz_type" "quiz_type" NOT NULL,
    "quiz_status" "quiz_status" NOT NULL,
    "quiz_visibility" "quiz_visibility" NOT NULL,
    "num_of_rounds" INTEGER NOT NULL,
    "num_of_plays" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "firebase_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "comment" TEXT,
    "author_id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,

    CONSTRAINT "rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_round" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "quiz_round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiestion" (
    "id" TEXT NOT NULL,
    "type" "question_type" NOT NULL,
    "value" INTEGER NOT NULL,
    "picture_url" TEXT,
    "text" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "acceptableAnswers" TEXT[],
    "roundId" TEXT NOT NULL,

    CONSTRAINT "quiestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_option" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "question_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_play" (
    "id" TEXT NOT NULL,
    "result" "quiz_result" NOT NULL,
    "type" "play_type" NOT NULL,
    "score" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "quiz_play_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_liked_quizes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_liked_quizes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_followers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_followers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_firebase_id_key" ON "user"("firebase_id");

-- CreateIndex
CREATE INDEX "_liked_quizes_B_index" ON "_liked_quizes"("B");

-- CreateIndex
CREATE INDEX "_followers_B_index" ON "_followers"("B");

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_author_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_author_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_quiz_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_round" ADD CONSTRAINT "quiz_round_quiz_fkey" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiestion" ADD CONSTRAINT "question_quiz_round_fkey" FOREIGN KEY ("roundId") REFERENCES "quiz_round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_option" ADD CONSTRAINT "question_question_option_fkey" FOREIGN KEY ("questionId") REFERENCES "quiestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_play" ADD CONSTRAINT "result_user_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_play" ADD CONSTRAINT "result_quiz_fkey" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_liked_quizes" ADD CONSTRAINT "_liked_quizes_A_fkey" FOREIGN KEY ("A") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_liked_quizes" ADD CONSTRAINT "_liked_quizes_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_followers" ADD CONSTRAINT "_followers_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_followers" ADD CONSTRAINT "_followers_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
