import { prisma } from '~/utils';
import {Quiz, QuizStatus, QuizType} from '@prisma/client';
import {NotFoundError} from "~/models";
import {messages} from "~/resources";


export class QuizService {
  static async createQuiz(
    name: string,
    quizType: QuizType,
    quizStatus: QuizStatus,
    numOfRounds: number,
    authorId: string,
  ) {
    const quiz = await prisma.quiz.create({
      data: {
        name,
        quizType,
        quizStatus,
        numOfRounds,
        numOfPlays: 0,
        rating: 0,
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
      throw new NotFoundError(messages.notFound('Quiz', id));
    }

    return quiz;
  }

  static async findQuizzes() {
    const quizzes = await prisma.quiz.findMany();

    return quizzes;
  }

  static async updateQuiz(
    id: string,
    data: Partial<Omit<Quiz, 'id'>>,
  ) {
    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        ...data,
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
      throw new NotFoundError(messages.notFound('Quiz', id));
    }

    await prisma.quiz.delete({
      where: { id }
    });

    return {message: messages.deleted('Quiz') };
  }
}
