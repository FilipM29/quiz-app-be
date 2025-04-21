import { prisma } from '~/utils';
import { Quiz, QuizStatus, QuizType, QuizVisibility } from '@prisma/client';
import { NotFoundError } from '~/models';
import { messages } from '~/resources';

export class QuizService {
  static async createQuiz(
    title: string,
    description: string,
    pictureUrl: string | undefined,
    quizType: QuizType,
    quizStatus: QuizStatus,
    quizVisibility: QuizVisibility,
    numOfRounds: number,
    authorId: string
  ) {
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        pictureUrl,
        quizType,
        quizStatus,
        quizVisibility,
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
      where: { id },
      include: {
        author: true,
        rounds: true
      }
    });

    if (!quiz) {
      throw new NotFoundError(messages.notFound('Quiz', id));
    }

    return quiz;
  }

  static async findQuizzes() {
    const quizzes = await prisma.quiz.findMany({
      where: {
        AND: [
          //{ quizStatus: QuizStatus.FINISHED }, for testing purposes
          { quizVisibility: QuizVisibility.PUBLIC }
        ]
      }
    });

    return quizzes;
  }

  static async findMyQuizzes(authorId: string) {
    const quizzes = await prisma.quiz.findMany({
      where: {
        authorId
      }
    });

    return quizzes;
  }

  static async updateQuiz(id: string, data: Partial<Omit<Quiz, 'id'>>) {
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

    return { message: messages.deleted('Quiz') };
  }
}
