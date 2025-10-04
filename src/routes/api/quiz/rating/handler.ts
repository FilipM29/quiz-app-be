import type { FastifyReply, FastifyRequest } from 'fastify';
import { messages } from '~/resources';

interface SubmitRatingBody {
  value: number;
  comment?: string;
}

interface QuizIdParams {
  quizId: string;
}

export const submitRating = async (
  req: FastifyRequest<{ Body: SubmitRatingBody; Params: QuizIdParams }>,
  reply: FastifyReply
) => {
  const { quizId } = req.params;
  const { value, comment } = req.body;
  const userId = req.user!.id;

  // Check if quiz exists
  const quiz = await req.server.prisma.quiz.findUnique({
    where: { id: quizId }
  });

  if (!quiz) {
    return reply
      .status(404)
      .send({ message: messages.notFound('Quiz', quizId) });
  }

  // Find existing rating
  const existingRating = await req.server.prisma.rating.findFirst({
    where: {
      authorId: userId,
      quizId
    }
  });

  // Create or update rating
  const rating = existingRating
    ? await req.server.prisma.rating.update({
        where: { id: existingRating.id },
        data: { value, comment }
      })
    : await req.server.prisma.rating.create({
        data: {
          value,
          comment,
          authorId: userId,
          quizId
        }
      });

  // Recalculate average rating for this quiz
  const avgResult = await req.server.prisma.rating.aggregate({
    where: { quizId },
    _avg: { value: true }
  });

  const averageRating = avgResult._avg.value || 0;

  // Update quiz rating
  await req.server.prisma.quiz.update({
    where: { id: quizId },
    data: { rating: Math.round(averageRating) }
  });

  reply.status(200).send(rating);
};

export const getMyRating = async (
  req: FastifyRequest<{ Params: QuizIdParams }>,
  reply: FastifyReply
) => {
  const { quizId } = req.params;
  const userId = req.user!.id;

  const rating = await req.server.prisma.rating.findFirst({
    where: {
      authorId: userId,
      quizId
    }
  });

  if (!rating) {
    return reply.status(404).send({ message: 'Rating not found' });
  }

  reply.status(200).send(rating);
};
