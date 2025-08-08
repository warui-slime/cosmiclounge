// import type { APIGatewayProxyHandler } from 'aws-lambda';
import { storeMessage, getGroupMembers } from '../../services/chat.service.js';
import { broadcastToUsers } from '../utils/sendMessage.js';

export const handler = async (event:any) => {
  const body = JSON.parse(event.body || '{}');
  const { toUserId, groupId, content } = body;

  // persist
  const msg = await storeMessage({ fromConn: event.requestContext.connectionId, toUserId, groupId, content });

  // fan-out
  if (groupId) {
    const members = await getGroupMembers(groupId);
    await broadcastToUsers(members, msg);
  } else if (toUserId) {
    await broadcastToUsers([toUserId], msg);
  }

  return { statusCode: 200, body: 'OK' };
};