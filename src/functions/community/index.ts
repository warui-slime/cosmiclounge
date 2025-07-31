import communityRoutes from "./community.routes.js";

import { buildServer } from "@shared/src/index.js";
import { FastifyInstance,awsLambdaFastify } from "@shared/src/utils/export.js";

import type { APIGatewayProxyEvent, Context,APIGatewayProxyResult } from "aws-lambda";

 


// const serverReady = buildServer(async (server: FastifyInstance) =>
//   server.register(communityRoutes, { prefix: "/api" })
// );

// const lambdaProxy = awsLambdaFastify(await serverReady);

// export const handler = async (event:APIGatewayProxyEvent, context:Context) => {
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
      server.register(communityRoutes, { prefix: '/auth' });
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
