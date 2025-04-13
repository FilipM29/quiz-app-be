import {QuizService} from "~/services/quiz";
import {QuizStatus, QuizType} from "@prisma/client";
import {messages} from "~/resources";
import {FastifyReply, FastifyRequest} from "fastify";

export const createQuiz = async (req: FastifyRequest, reply: FastifyReply) => {
  const { name, quizType, quizStatus, numOfRounds, numOfPlays, rating, authorId } =
    req.body as {
      name: string;
      quizType: QuizType;
      quizStatus: QuizStatus;
      numOfRounds: number;
      numOfPlays: number;
      rating: number;
      authorId: string;
    };

  const quiz = await QuizService.createQuiz(
    name,
    quizType,
    quizStatus,
    numOfRounds,
    numOfPlays,
    rating,
    authorId
  );
  reply.status(201).send(quiz);
}

export const getQuizById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    const quiz = await QuizService.findQuiz(id);
    reply.status(200).send(quiz);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('quiz', id) });
  }
};

export const getAllQuizzes = async (_req: FastifyRequest, reply: FastifyReply) => {
  const quizzes = await QuizService.findQuizzes();
  reply.status(200).send(quizzes);
}

export const updateQuiz = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const { name, quizType, quizStatus, numOfRounds, numOfPlays, rating } = req.body as {
    name: string;
    quizType: QuizType;
    quizStatus: QuizStatus;
    numOfRounds: number;
    numOfPlays: number;
    rating: number;
  };

  try {
    const quiz = await QuizService.updateQuiz(
      id,
      name,
      quizType,
      quizStatus,
      numOfRounds,
      numOfPlays,
      rating
    );
    reply.status(200).send(quiz);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('quiz', id) });
  }
};

export const deleteQuiz = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    const result = await QuizService.deleteQuiz(id);
    reply.status(200).send(result);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('quiz', id) });
  }
}

