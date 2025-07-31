import { customAlphabet } from "nanoid";
import { prisma } from "../utils/prisma.js";
import { TaddMember, TcommunityCreate, TdeleteCommunity, TexitCommunity, TgetAllCommunities, TgetCommunitybyCode, TgetCommunityById, TgetCommunityMembers, TgetUserCommunities, TmakeAdmin, TremoveMember, TupdateCommunity, TupdateCommunityBanner, TupdateCommunityDescription, TupdateCommunityName, TupdateCommunityRules, TupdateRole } from "../validators/community.validator.js";
import { AppError } from "../errors/appError.js";


const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 5;


export class CommunityService {
    async createCommunity(data: TcommunityCreate) {

        const nanoid = customAlphabet(ALPHABET, CODE_LENGTH);

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            const joinCode = nanoid();

            try {
                const community = await prisma.community.create({
                    data: {
                        name: data.name,
                        description: data.description,
                        type: data.type,
                        rules: data.rules,
                        createdById: data.userId,
                        joinCode: joinCode,
                        members: {
                            create: {
                                userId: data.userId,
                                role: 'ADMIN',
                            },
                        },
                    },
                    include: { members: true },
                });
                return community;
            } catch (err: any) {

                if (err.code === 'P2002') {
                    if (attempt === MAX_ATTEMPTS) break;
                    continue;
                }
                throw err;
            }

        }
        throw new AppError('Failed to generate a unique join code after multiple attempts', 500,'JOIN_CODE_GENERATION_FAILED')
    }

    async getAllCommunities(data: TgetAllCommunities) {
        const { type, search, page = 1, limit = 10 } = data;

        const where: any = {};
        if (type) where.type = type;
        if (search) where.name = { contains: search as string, mode: 'insensitive' };

        const communities = await prisma.community.findMany({
            where,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            include: {
                _count: {
                    select: { members: true, rooms: true, events: true }
                }
            }
        });
        return communities
    }

    async getCommunityById(data: TgetCommunityById) {
        const community = await prisma.community.findUnique({
            where: { id: data.communityId },
            include: {
                members: {
                    select: {
                        role: true,
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            },
                        },
                        
                    }
                }
            }
        });

        if (!community) {
            throw new AppError('Community Not Found', 404,'NOT_FOUND')

        }
        return community
    }
    async getCommunityByCode(data: TgetCommunitybyCode) {
        const community = await prisma.community.findUnique({
            where: { joinCode: data.joinCode },
            include: {
                members: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            },
                        },
                        role: true
                    }
                }
            }
        });

        if (!community) {
            throw new AppError('Community Not Found', 404,'NOT_FOUND')
        }
        return community
    }

    async getCommunityMembers(data: TgetCommunityMembers) {
        try {
            const members = await prisma.community.findUniqueOrThrow({
                where: { id: data.communityId },
                include: {
                    members: {
                        select: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatarUrl: true,
                                },
                            },
                            role: true
                        }
                    }
                }
            });
            return members
        } catch (err: any) {
            if (err.code === 'P2025') {
                throw new AppError('Community Not Found', 404,'NOT_FOUND')
            }
            throw err;
        }

    }




    async updateCommunityName(data: TupdateCommunityName) {
        const { userId, communityId, name } = data
        await this.updatePreCheck(userId, communityId)
        await prisma.community.update({
            where: { id: data.communityId },
            data: { name: name }
        })
    }
    async updateCommunityBanner(data: TupdateCommunityBanner) {
        const { userId, communityId, bannerUrl } = data
        await this.updatePreCheck(userId, communityId)
        await prisma.community.update({
            where: { id: data.communityId },
            data: { bannerUrl: bannerUrl }
        })
    }

    async updateCommunityDescription(data: TupdateCommunityDescription) {
        const { userId, communityId, description } = data
        await this.updatePreCheck(userId, communityId)
        await prisma.community.update({
            where: { id: data.communityId },
            data: { description: description }
        })
    }
    async updateCommunityRules(data: TupdateCommunityRules) {
        const { userId, communityId, rules } = data
        await this.updatePreCheck(userId, communityId)
        await prisma.community.update({
            where: { id: data.communityId },
            data: { rules }
        })
    }

    async updatePreCheck(userId: string, communityId: string) {
        const findcommunity = await prisma.community.findUnique({
            where: { id: communityId },
            include: {
                members: {
                    where: { userId: userId },
                    select: { role: true }
                }
            }
        })
        if (!findcommunity) {
            throw new AppError('Community Not Found', 404,'NOT_FOUND')
        }
        const member = findcommunity.members[0];

        if (!member || member.role !== 'ADMIN') {
            throw new AppError('Forbidden', 403,'NOT_ALLOWED');
        }
    }


    async deleteCommunity(data: TdeleteCommunity) {
        const { userId, communityId } = data;
        const findcommunity = await prisma.community.findUnique({
            where: { id: communityId },
            include: {
                members: {
                    where: { userId: userId },
                    select: { role: true }
                }
            }
        })
        console.log(findcommunity);
        

        if (!findcommunity) {
            throw new AppError('Community Not Found', 404,'NOT_FOUND')
        }

        else if (findcommunity.members[0].role !== 'ADMIN') {
            throw new AppError('Forbidden', 403,'NOT_ALLOWED')
        }

        else if (findcommunity.members[0].role === 'ADMIN') {
            await prisma.community.delete({
                where: { id: communityId },
            })
        }

    }

    async addMember(data: TaddMember) {
        const { joinCode, userId } = data;
        const community = await prisma.community.findUnique({
            where: { joinCode: joinCode },
        });
        if (!community) {
            throw new AppError('Invalid join code', 404,'INVALID_JOIN_CODE');
        }
        try {
            const membership = await prisma.communityMember.create({
                data: {
                    communityId: community.id,
                    userId: userId,
                    role: 'MEMBER',
                },
            });
            return membership;
        } catch (err: any) {


            if (err.code === 'P2002') {
                throw new AppError('User is already joined', 409,'ALREADY_JOINED')
            }
            throw err;
        }
    }

    async removeMember(data: TremoveMember) {
        const [_communityName, requesterRole, targetRole] = await this.helpCommunity(data)

        if (requesterRole!.role === "MEMBER") {
            throw new AppError('Forbidden', 403,'NOT_ALLOWED')
        }
        else if (requesterRole!.role === targetRole!.role) {
            throw new AppError('Forbidden', 403,'NOT_ALLOWED')
        }
        else if (requesterRole!.role === 'MODERATOR' && (targetRole!.role === 'ADMIN' || targetRole!.role === 'MODERATOR')) {
            throw new AppError('Forbidden', 403,'NOT_ALLOWED')
        }
        await prisma.communityMember.delete({
            where: {
                userId_communityId: {
                    userId: data.userId,
                    communityId: data.communityId
                }
            }
        })
    }

    async updateRole(data: TupdateRole) {
        const [_communityName, requester, target] = await this.helpCommunity(data)

        if (data.requesterId === data.userId) {
            throw new AppError('Make someone else admin first', 403,'NOT_ALLOWED')
        }
        if (requester!.role !== 'ADMIN') {

            throw new AppError('Forbidden', 403,'NOT_ALLOWED')
        }
        if (data.role===target!.role) {
            throw new AppError(`User is already a ${data.role}`,403,'NOT_ALLOWED')
        }


        await prisma.communityMember.update({
            where: {
                userId_communityId: {
                    userId: data.userId, communityId: data.communityId
                }
            },
            data: {
                role: data.role
            }
        })
    }

    async makeAdmin(data: TmakeAdmin) {
        const [_communityName, requesterRole, targetRole] = await this.helpCommunity(data);

        if (requesterRole!.role !== 'ADMIN') {
            throw new AppError('Forbidden', 403,'NOT_ALLOWED')
        }
        if (targetRole!.role !== 'MODERATOR') {
            throw new AppError('First promote the user to Moderator', 406,'NOT_ALLOWED')
        }
        await prisma.$transaction([
            prisma.communityMember.update({
                where: {
                    userId_communityId: {
                        userId: data.userId,
                        communityId: data.communityId
                    }
                },
                data: { role: 'ADMIN' }
            }),
            prisma.communityMember.update({
                where: {
                    userId_communityId: {
                        userId: data.requesterId,
                        communityId: data.communityId
                    }
                },
                data: { role: 'MODERATOR' }
            })
        ]);


    }

    async exitCommunity(data: TexitCommunity) {

        const membership = await prisma.communityMember.findUnique({
            where: { userId_communityId: { userId: data.userId, communityId: data.communityId } },
        })


        if (!membership) {

            throw new AppError('You are not a member of this community', 403,'NOT_ALLOWED')
        }

        if (membership.role === 'ADMIN') {
            throw new AppError('Community admin cannot exit. Transfer admin role or delete community instead', 403,'NOT_ALLOWED');
        }

        await prisma.communityMember.delete({
            where: { userId_communityId: { userId: membership.userId, communityId: membership.communityId } }
        });


    }

    async getUserCommunities(data: TgetUserCommunities) {
        
        const membership = await prisma.communityMember.findMany({
            where: { user: { username: data.username } },
            select: {
                community: {
                    select: { id: true, name: true, joinCode: true, _count: { select: { members: true, events: true } } }
                }
            },
            orderBy: { joinedAt: 'desc' }
        });
        return { communities: membership }
    }

    private async helpCommunity(data: TremoveMember) {
        const requestedData = await Promise.all([
            prisma.community.findUnique({
                where: { id: data.communityId },
                select: { name: true }
            }),
            prisma.communityMember.findUnique({
                where: { userId_communityId: { userId: data.requesterId, communityId: data.communityId } },
                select: { role: true }
            }),
            prisma.communityMember.findUnique({
                where: { userId_communityId: { userId: data.userId, communityId: data.communityId } },
                select: { role: true }
            })
        ]);
        const [communityName, requester, target] = requestedData

        if (!communityName) {
            throw new AppError('Community Not Found', 404,'NOT_FOUND');
        }
        if (!requester) {
            throw new AppError('You are not part of this community', 403,'NOT_ALLOWED');
        }
        if (!target) {
            throw new AppError('User not part of this community', 404,'NOT_FOUND');
        }

        return requestedData;
    }





}