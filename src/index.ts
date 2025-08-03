import fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifyCors from '@fastify/cors';
import { errorHandler } from './middleware/errorHandler.js';
import userAuth from './routes/auth.routes.js';
import communityRoutes from './routes/community.routes.js';
import awsLambdaFastify from '@fastify/aws-lambda';
import fastifyCookie from '@fastify/cookie';



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



server.register(fastifyCors, {
  origin: true,
  credentials: true,
});

server.register(fastifyCookie,{
  secret: process.env.COOKIE_SECRET!
})


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



const lambdaProxy = awsLambdaFastify(server);
export const handler = async (event: any, context: any) => {
  console.log('Handler invoked with event:', event);
  await initServer();
  return lambdaProxy(event, context);
};
