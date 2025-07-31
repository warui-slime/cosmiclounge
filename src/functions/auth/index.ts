import { buildServer } from "@shared/src/index.js";
import userAuth from "./auth.routes.js";
import { FastifyInstance, awsLambdaFastify } from "@shared/src/utils/export.js";
import type { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";

const serverReady = buildServer(async (server: FastifyInstance) =>
  server.register(userAuth, { prefix: "/api" })
);

// const lambdaProxy = awsLambdaFastify(await serverReady);

// export const handler = async (event:APIGatewayProxyEvent, context:Context) => {
//   return lambdaProxy(event, context);
// };

// let lambdaProxy: ReturnType<typeof awsLambdaFastify> | null = null;

// export const handler = async (
//   event: APIGatewayProxyEvent,
//   context: Context
// ) => {
//   // initialize Fastify server and only-await inside handler
//   const server = await buildServer(async (server) => {
//     server.register(userAuth, { prefix: "/api" });
//   });
//   const lambdaProxy = awsLambdaFastify(server);

//   return lambdaProxy(event, context);
// };

let lambdaProxy: ReturnType<typeof awsLambdaFastify> | null = null;

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  if (!lambdaProxy) {
    // First cold start: build & cache
    const server = await buildServer(async (server:FastifyInstance) => {
      server.register(userAuth, { prefix: '/auth' });
    });
    lambdaProxy = awsLambdaFastify(server);
  }

  // Wrap the callback-style proxy in a Promise for async/await
  return new Promise((resolve, reject) => {
    lambdaProxy!(
      event,
      context,
      (err?: Error | null, result?: APIGatewayProxyResult) => {
        if (err) reject(err);
        else resolve(result!);
      }
    );
  });
};
