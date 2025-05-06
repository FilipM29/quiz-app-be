import { prisma } from '~/utils';
import { NotFoundError } from '~/models';
import { messages } from '~/resources';
import { QuestionType } from '@prisma/client';

export class QuestionsService {
  static async createQuestion(
    roundId: string,
    text: string,
    value: number,
    type: QuestionType,
    answer: string,
    acceptableAnswers?: string[],
    range?: number | undefined,
    options?: string[]
  ) {
    const optionsExists = options && options.length > 0;

    const question = await prisma.question.create({
      data: {
        roundId,
        text,
        value,
        type,
        answer,
        acceptableAnswers,
        range
      },
      include: {
        options: optionsExists
      }
    });

    if (optionsExists) {
      await prisma.answerOption.createMany({
        data: options.map((option) => ({
          text: option,
          questionId: question.id
        }))
      });
    }
    return question;
  }

  static async getQuestionById(id: string) {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        options: true
      }
    });

    if (!question) {
      throw new NotFoundError(messages.notFound('Question', id));
    }

    return question;
  }

  static async getQuestionsByRoundId(roundId: string) {
    const questions = await prisma.question.findMany({
      where: { roundId },
      include: {
        options: true
      }
    });
    return questions;
  }

  static async updateQuestion(
    id: string,
    text?: string,
    value?: number,
    type?: QuestionType,
    answer?: string,
    acceptableAnswers?: string[],
    range?: number,
    options?: string[]
  ) {
    const data = {
      ...(text && { text }),
      ...(value && { value }),
      ...(type && { type }),
      ...(answer && { answer }),
      ...(range && { range }),
      ...(acceptableAnswers && { acceptableAnswers })
    };

    const question = await prisma.question.update({
      where: { id },
      data
    });

    if (options) {
      // Delete existing options for the question
      await prisma.answerOption.deleteMany({
        where: { questionId: id }
      });

      // Add new options
      await prisma.answerOption.createMany({
        data: options.map((option) => ({
          text: option,
          questionId: id
        }))
      });
    }

    return question;
  }

  static async deleteQuestion(id: string) {
    const question = await prisma.question.findUnique({
      where: { id }
    });

    if (!question) {
      throw new NotFoundError(messages.notFound('Question', id));
    }

    await prisma.question.delete({
      where: { id }
    });

    return { message: messages.deleted('Question') };
  }
}
