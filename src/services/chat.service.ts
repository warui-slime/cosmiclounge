import { prisma } from '../utils/prisma.js';

export async function storeMessage({ fromConn, toUserId, groupId, content }: any) {
  // look up fromUserId via connectionStore if needed
  return prisma.message.create({
    data: { fromUserId: fromConn, toUserId, groupId, content },
  });
}

export async function getGroupMembers(groupId: string) {
  const members = await prisma.groupMember.findMany({ where: { groupId } });
  return members.map(m => m.userId);
}