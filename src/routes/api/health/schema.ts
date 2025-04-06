import type { FastifyInstance, FastifySchema } from 'fastify';
import { getHealth } from './handler';
import { Type } from '@sinclair/typebox';

const getHealthSchema: FastifySchema = {
  description: 'Returns health status of application',
  tags: ['health'],
  response: {
    200: Type.Object({
      message: Type.String()
    })
  }
};

export const getHealthOpt = (_fastify: FastifyInstance) => ({
  schema: getHealthSchema,
  handler: getHealth
});
