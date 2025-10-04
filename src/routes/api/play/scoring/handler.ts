import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '~/utils';
import { messages } from '~/resources';

interface ScoreAnswerRequest {
  isCorrect: boolean;
  points: number;
  feedback?: string;
}

export const getPendingSessions = async (
  _req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const sessions = await prisma.playSession.findMany({
      where: {
        playType: 'MULTI_OFFLINE',
        playerAnswers: {
          some: {
            scoringStatus: 'PENDING'
          }
        }
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            pictureUrl: true
          }
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            playerAnswers: {
              where: {
                scoringStatus: 'PENDING'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    reply.status(200).send(sessions);
  } catch {
    reply.status(500).send({ message: 'Failed to get pending sessions' });
  }
};

export const getSessionWithAnswers = async (
  req: FastifyRequest<{ Params: { sessionId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.playSession.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            pictureUrl: true
          }
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        players: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        playerAnswers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
                answer: true,
                value: true,
                pictureUrl: true
              }
            },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            scoredBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: [
            {
              user: {
                lastName: 'asc'
              }
            },
            {
              submittedAt: 'asc'
            }
          ]
        }
      }
    });

    if (!session) {
      return await reply
        .status(404)
        .send({ message: messages.notFound('Session', sessionId) });
    }

    reply.status(200).send(session);
  } catch {
    reply.status(500).send({ message: 'Failed to get session details' });
  }
};

export const getPendingAnswers = async (
  req: FastifyRequest<{ Params: { sessionId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { sessionId } = req.params;
    const answers = await prisma.playerAnswer.findMany({
      where: {
        playSessionId: sessionId,
        scoringStatus: 'PENDING'
      },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            type: true,
            answer: true,
            value: true,
            pictureUrl: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        {
          user: {
            lastName: 'asc'
          }
        },
        {
          submittedAt: 'asc'
        }
      ]
    });

    reply.status(200).send(answers);
  } catch {
    reply.status(500).send({ message: 'Failed to get pending answers' });
  }
};

export const scoreAnswer = async (
  req: FastifyRequest<{
    Params: { answerId: string };
    Body: ScoreAnswerRequest;
  }>,
  reply: FastifyReply
) => {
  try {
    const { answerId } = req.params;
    const { isCorrect, points, feedback } = req.body;

    if (!req.user) {
      return await reply
        .status(401)
        .send({ message: 'Authentication required' });
    }

    // Get the answer
    const answer = await prisma.playerAnswer.findUnique({
      where: { id: answerId },
      include: {
        playSession: true
      }
    });

    if (!answer) {
      return await reply
        .status(404)
        .send({ message: messages.notFound('Answer', answerId) });
    }

    // Update the answer with scoring
    const updatedAnswer = await prisma.playerAnswer.update({
      where: { id: answerId },
      data: {
        scoringStatus: 'MANUALLY_SCORED',
        isCorrect,
        points,
        teacherFeedback: feedback,
        scoredById: req.user.id,
        scoredAt: new Date()
      },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            type: true,
            value: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        scoredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Update session player's score
    await prisma.sessionPlayer.updateMany({
      where: {
        playSessionId: answer.playSessionId,
        ...(answer.userId
          ? { userId: answer.userId }
          : { guestIdentifier: answer.guestIdentifier! })
      },
      data: {
        score: {
          increment: points
        }
      }
    });

    reply.status(200).send(updatedAnswer);
  } catch (error) {
    reply.status(500).send({
      message: error instanceof Error ? error.message : 'Failed to score answer'
    });
  }
};

export const getQuizSessions = async (
  req: FastifyRequest<{ Params: { quizId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { quizId } = req.params;
    const sessions = await prisma.playSession.findMany({
      where: {
        quizId,
        playType: 'MULTI_OFFLINE'
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            players: true,
            playerAnswers: {
              where: {
                scoringStatus: 'PENDING'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    reply.status(200).send(sessions);
  } catch {
    reply.status(500).send({ message: 'Failed to get quiz sessions' });
  }
};
