import { createClient } from 'redis';

const client = createClient({ url: process.env.VALKEY_ENDPOINT });
client.connect();

const PREFIX = 'chat:conn';

export async function saveConnection(userId: string, connectionId: string) {
  await client.hSet(`${PREFIX}:users`, userId, connectionId);
}

export async function removeConnectionByConn(connId: string) {
  const users = await client.hGetAll(`${PREFIX}:users`);
  for (const [userId, conn] of Object.entries(users)) {
    if (conn === connId) {
      await client.hDel(`${PREFIX}:users`, userId);
      break;
    }
  }
}

export async function getConnectionId(userId: string) {
  return await client.hGet(`${PREFIX}:users`, userId);
}