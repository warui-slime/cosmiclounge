import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { errorHandler } from './middleware/errorHandler.js';



export const buildServer = async (registerRoutes: (server: FastifyInstance) => Promise<void>) => {
  const server = fastify({
    logger: true,
    ajv: { customOptions: { strict: false } }
  }).withTypeProvider<ZodTypeProvider>();

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);
  server.setErrorHandler(errorHandler);

  server.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });

  server.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

 
  server.get('/', async () => ({ message: 'Hello from warui!' }));


  await registerRoutes(server);

  return server;
};