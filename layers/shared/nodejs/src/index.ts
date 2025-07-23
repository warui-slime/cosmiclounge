import fastify from 'fastify';
import awsLambdaFastify from '@fastify/aws-lambda';
import type {  FastifyRequest, FastifyReply } from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import userAuth from 'auth-routes/index.js';
import communityRoutes from 'community-routes/index.js';
import { errorHandler } from 'cosmic/src/middleware/errorHandler.js';
// import { prisma } from './utils/prisma.js';

const server = fastify({ 
  logger: true,
  ajv: {
    customOptions: {
      strict: false
    }
  }
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler(errorHandler)

// Register cookie plugin
server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || "my-secret-key",
});

server.register(fastifyCors, {
  origin: true,
  credentials: true,
});




server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
  return { message: `Hello from warui!` };
});

// Initialize the server asynchronously
const initServer = async () => {
  try {
    await server.register(userAuth, { prefix: "/api/auth" });
    await server.register(communityRoutes, { prefix: "/api/communities" });
  } catch (error) {
    server.log.error(error);
    throw error;
  }
};

// Create a promise that resolves when the server is initialized
const serverReady = initServer();

const lambdaProxy = awsLambdaFastify(server);
// Export the handler wrapped in async initialization
export const handler = async (event: any, context: any) => {
  console.log('Handler invoked with event:', event);
  await serverReady;
  return lambdaProxy(event, context);;
};