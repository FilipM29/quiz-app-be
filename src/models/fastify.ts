import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";

export type QuizAppFastifyInstance = FastifyInstance & {
  authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
}
