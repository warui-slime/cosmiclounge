import fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifyCors from '@fastify/cors';
import { errorHandler } from './middleware/errorHandler.js';
import userAuth from './routes/auth.routes.js';
import communityRoutes from './routes/community.routes.js';
import awsLambdaFastify from '@fastify/aws-lambda';

const server = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

// 1) Setup serializers, validators, error handler, CORS, etc.
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler(errorHandler);
server.register(fastifyCors, { origin: true, credentials: true });

// 2) Register all of your routes ONCE here
server.register(userAuth, { prefix: '/api/auth' });
server.register(communityRoutes, { prefix: '/api/communities' });

// 3) Wrap and export the Lambda handler
const lambdaProxy = awsLambdaFastify(server);
export const handler = lambdaProxy;
