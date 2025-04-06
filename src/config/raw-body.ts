import type { RawBodyPluginOptions } from 'fastify-raw-body';

export const rawBodyOptions: RawBodyPluginOptions = {
  field: 'rawBody',
  global: false,
  encoding: false,
  runFirst: true,
  routes: []
};
