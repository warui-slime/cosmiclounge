// import type { APIGatewayProxyHandler } from 'aws-lambda';
import { removeConnectionByConn } from '../utils/connectionStore.js';

export const handler = async (event: any) => {
  await removeConnectionByConn(event.requestContext.connectionId);
  return { statusCode: 200, body: 'Disconnected' };
};