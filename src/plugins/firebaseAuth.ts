import fastifyPlugin from "fastify-plugin";
import {FastifyReply} from "fastify";
import fp from 'fastify-plugin';
import firebaseAccount from 'firebase.json';
import {credential, ServiceAccount} from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import {QuizAppFastifyRequest} from "~/models/request";
import {initializeApp} from "firebase-admin/app";

const firebase = initializeApp({ credential: credential.cert(firebaseAccount as ServiceAccount)});
const firebaseAuth = getAuth(firebase);

const firebaseAuthPlugin = fastifyPlugin(async (fastify) => {
  fastify.decorate('authenticate', async (request: QuizAppFastifyRequest, reply: FastifyReply) => {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          reply.code(401).send({ error: 'Unauthorized: No token provided!' });
          return;
        }

        const token = authHeader.split(' ')[1];
        request.firebaseUser = await firebaseAuth.verifyIdToken(token as string);
      } catch (error) {
        reply.code(401).send({ error: 'Unauthorized: Invalid token!' });
        return;
      }
    }
  );
})

export default fp(firebaseAuthPlugin)
