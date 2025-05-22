import fastifyPlugin from "fastify-plugin";
import {FastifyReply} from "fastify";
import firebaseAccount from 'firebase.json';
import {auth, credential, ServiceAccount} from "firebase-admin";
import {QuizAppFastifyRequest} from "~/models/request";
import {initializeApp} from "firebase-admin/app";

initializeApp({ credential: credential.cert(firebaseAccount as ServiceAccount)});

export const firebaseAuthPlugin = fastifyPlugin(async (fastify) => {
  fastify.decorate('authenticate', async (request: QuizAppFastifyRequest, reply: FastifyReply) => {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          reply.code(401).send({ error: 'Unauthorized: No token provided!' });
          return;
        }

        const token = authHeader.split(' ')[1];
        request.firebaseUser = await auth().verifyIdToken(token as string);
      } catch (error) {
        reply.code(401).send({ error: 'Unauthorized: Invalid token!' });
        return;
      }
    }
  );
})
