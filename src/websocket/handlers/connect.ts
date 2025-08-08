import { ApiGatewayManagementApi } from 'aws-sdk';
import { getConnectionId } from '../utils/connectionStore.js';

const apigw = new ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_URL,
});

export async function sendToConnection(connectionId: string, payload: any) {
  await apigw
    .postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(payload) })
    .promise();
}

export async function broadcastToUsers(userIds: string[], payload: any) {
  for (const uid of userIds) {
    const connId = await getConnectionId(uid);
    if (connId) await sendToConnection(connId, payload);
  }
}