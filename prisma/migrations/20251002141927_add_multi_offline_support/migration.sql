-- CreateEnum
CREATE TYPE "public"."session_status" AS ENUM ('WAITING', 'ACTIVE', 'FINISHED');

-- CreateEnum
CREATE TYPE "public"."scoring_status" AS ENUM ('PENDING', 'AUTO_SCORED', 'MANUALLY_SCORED');

-- AlterTable
ALTER TABLE "public"."question" ADD COLUMN     "requires_manual_score" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."play_session" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "play_type" "public"."play_type" NOT NULL,
    "status" "public"."session_status" NOT NULL DEFAULT 'WAITING',
    "current_round" INTEGER NOT NULL DEFAULT 0,
    "current_question" INTEGER NOT NULL DEFAULT 0,
    "max_players" INTEGER NOT NULL DEFAULT 10,
    "time_per_question" INTEGER NOT NULL DEFAULT 30,
    "show_correct_answer" BOOLEAN NOT NULL DEFAULT true,
    "allow_late_join" BOOLEAN NOT NULL DEFAULT false,
    "randomize_questions" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ,
    "finished_at" TIMESTAMPTZ,

    CONSTRAINT "play_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_player" (
    "id" TEXT NOT NULL,
    "play_session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "guest_identifier" TEXT,
    "username" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "is_guest" BOOLEAN NOT NULL DEFAULT false,
    "is_ready" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."player_answer" (
    "id" TEXT NOT NULL,
    "play_session_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "user_id" TEXT,
    "guest_identifier" TEXT,
    "answer" TEXT NOT NULL,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scoring_status" "public"."scoring_status" NOT NULL DEFAULT 'PENDING',
    "is_correct" BOOLEAN,
    "points" INTEGER,
    "time_to_answer" INTEGER,
    "teacher_feedback" TEXT,
    "scored_by_id" TEXT,
    "scored_at" TIMESTAMPTZ,

    CONSTRAINT "player_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "play_session_quiz_id_idx" ON "public"."play_session"("quiz_id");

-- CreateIndex
CREATE INDEX "play_session_host_id_idx" ON "public"."play_session"("host_id");

-- CreateIndex
CREATE INDEX "play_session_status_idx" ON "public"."play_session"("status");

-- CreateIndex
CREATE INDEX "play_session_play_type_idx" ON "public"."play_session"("play_type");

-- CreateIndex
CREATE INDEX "play_session_created_at_idx" ON "public"."play_session"("created_at");

-- CreateIndex
CREATE INDEX "session_player_session_id_idx" ON "public"."session_player"("play_session_id");

-- CreateIndex
CREATE INDEX "session_player_user_id_idx" ON "public"."session_player"("user_id");

-- CreateIndex
CREATE INDEX "session_player_guest_id_idx" ON "public"."session_player"("guest_identifier");

-- CreateIndex
CREATE INDEX "player_answer_session_id_idx" ON "public"."player_answer"("play_session_id");

-- CreateIndex
CREATE INDEX "player_answer_question_id_idx" ON "public"."player_answer"("question_id");

-- CreateIndex
CREATE INDEX "player_answer_user_id_idx" ON "public"."player_answer"("user_id");

-- CreateIndex
CREATE INDEX "player_answer_scoring_status_idx" ON "public"."player_answer"("scoring_status");

-- CreateIndex
CREATE INDEX "player_answer_session_question_idx" ON "public"."player_answer"("play_session_id", "question_id");

-- AddForeignKey
ALTER TABLE "public"."play_session" ADD CONSTRAINT "play_session_quiz_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."play_session" ADD CONSTRAINT "play_session_host_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_player" ADD CONSTRAINT "session_player_session_fkey" FOREIGN KEY ("play_session_id") REFERENCES "public"."play_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_player" ADD CONSTRAINT "session_player_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."player_answer" ADD CONSTRAINT "player_answer_session_fkey" FOREIGN KEY ("play_session_id") REFERENCES "public"."play_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."player_answer" ADD CONSTRAINT "player_answer_question_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."player_answer" ADD CONSTRAINT "player_answer_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."player_answer" ADD CONSTRAINT "player_answer_scorer_fkey" FOREIGN KEY ("scored_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
