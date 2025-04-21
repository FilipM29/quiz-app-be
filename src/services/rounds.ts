import { prisma } from '~/utils';
import { NotFoundError } from '~/models';
import { messages } from '~/resources';

export class RoundsService {
  static async createRound(quizId: string, order: number, title: string) {
    const round = await prisma.quizRound.create({
      data: {
        quizId,
        order,
        title
      }
    });
    return round;
  }

  static async getRoundById(id: string) {
    const round = await prisma.quizRound.findUnique({
      where: { id }
    });

    if (!round) {
      throw new NotFoundError(messages.notFound('Round', id));
    }

    return round;
  }

  static async getRoundsByQuizId(quizId: string) {
    const rounds = await prisma.quizRound.findMany({
      where: { quizId }
    });
    return rounds;
  }

  static async updateRound(id: string, title?: string, order?: number) {
    const round = await prisma.quizRound.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(order !== undefined && { order })
      }
    });
    return round;
  }

  static async deleteRound(id: string) {
    const round = await prisma.quizRound.findUnique({
      where: { id }
    });

    if (!round) {
      throw new NotFoundError(messages.notFound('Round', id));
    }

    await prisma.quizRound.delete({
      where: { id }
    });

    return { message: messages.deleted('Round') };
  }
}
