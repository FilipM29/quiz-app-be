import { prisma } from '~/utils';
import { QuizStatus, QuizType} from '@prisma/client';
import {NotFoundError} from "~/models";
import {messages} from "~/resources";


export class QuizService {
  static async createQuiz(
    name: string,
    quizType: QuizType,
    quizStatus: QuizStatus,
    numOfRounds: number,
    numOfPlays: number,
    rating: number,
    authorId: string,
  ) {
    const quiz = await prisma.quiz.create({
      data: {
        name,
        quizType,
        quizStatus,
        numOfRounds,
        numOfPlays,
        rating,
        authorId
      }
    });

    return quiz;
  }

  static async findQuiz(id: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!quiz) {
      throw new NotFoundError(messages.notFound('quiz', id));
    }

    return quiz;
  }

  static async findQuizzes() {
    const quizzes = await prisma.quiz.findMany();

    return quizzes;
  }

  static async updateQuiz(
    id: string,
    name: string,
    quizType: QuizType,
    quizStatus: QuizStatus,
    numOfRounds: number,
    numOfPlays: number,
    rating: number
  ) {
    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        name,
        quizType,
        quizStatus,
        numOfRounds,
        numOfPlays,
        rating,
        updatedAt: new Date()
      }
    });

    return quiz;
  }

  static async deleteQuiz(id: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!quiz) {
      throw new NotFoundError(messages.notFound('quiz', id));
    }

    await prisma.quiz.delete({
      where: { id }
    });

    return {message: messages.deleted('quiz') };
  }
}
