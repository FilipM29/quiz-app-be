import {FastifyRequest} from "fastify";
import { auth } from "firebase-admin";

export type QuizAppFastifyRequest = FastifyRequest & {
  firebaseUser: auth.DecodedIdToken
}
