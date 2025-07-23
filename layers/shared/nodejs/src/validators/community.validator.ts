import { z } from "zod/v4";

export const communityNameValidation = z
    .string()
    .min(3, "Community name must be atleast 3 characters")
    .max(30, "Community name must be no more than 30 characters")
    .regex(/^[a-zA-Z0-9 ]+$/, "Community name must not contain special characters")



export const communityCreateSchema = z.object({
    userId: z.string(),
    name: communityNameValidation,
    description: z.string().optional(),
    type: z.enum(['CINEMA', 'MUSIC', 'SPORTS']),
    rules: z.string().optional(),

})

export const getAllCommunitiesSchema = z.object({
    type: z.enum(['CINEMA', 'MUSIC', 'SPORTS']),
    search: z.string(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().default(10)

})

export const getCommunityByIdSchema = z.object({
    communityId: z.cuid()
})

export const getCommunitybyCodeSchema = z.object({
    joinCode:z.string()
})

export const getCommunityMembersSchema= z.object({
    communityId: z.cuid()
})

export const updateCommunitySchema = z.object({
    userId: z.cuid(),
    communityId: z.cuid(),
    name: communityNameValidation.optional(),
    description: z.string().optional(),
    type: z.enum(['CINEMA', 'MUSIC', 'SPORTS']).optional(),
    bannerUrl: z.string().optional(),
    rules: z.string().optional(),
})

export const updateCommunityNameSchema = z.object({
    userId: z.cuid(),
    communityId: z.cuid(),
    name:communityNameValidation
})

export const updateCommunityBannerSchema = z.object({
    userId: z.cuid(),
    communityId: z.cuid(),
    bannerUrl: z.string().url()
})

export const updateCommunityDescriptionSchema = z.object({
    userId: z.cuid(),
    communityId: z.cuid(),
    description:z.string()
})
export const updateCommunityRulesSchema = z.object({
    userId: z.cuid(),
    communityId: z.cuid(),
    rules:z.string()
})


export const deleteCommunitySchema = z.object({
    userId: z.cuid(),
    communityId: z.cuid()
})

export const addMemberSchema = z.object({
    joinCode: z.string(),
    userId: z.cuid(),
})

export const removeMemberSchema = z.object({
    communityId: z.cuid(),
    userId: z.cuid(),
    requesterId: z.cuid(),
})

export const updateRoleSchema = z.object({
    communityId: z.cuid(),
    userId: z.cuid(),
    requesterId: z.cuid(),
    role:z.enum(['MEMBER','MODERATOR'])
})

export const makeAdminSchema = z.object({
    communityId: z.cuid(),
    userId: z.cuid(),
    requesterId: z.cuid()
})

export const exitCommunitySchema = z.object({
    communityId: z.cuid(),
    userId: z.cuid(),
})

export const getUserCommunitiesSchema = z.object({
    username:z.string()
})

export type TcommunityCreate = z.infer<typeof communityCreateSchema>;
export type TgetAllCommunities = z.infer<typeof getAllCommunitiesSchema>;
export type TgetCommunityById = z.infer<typeof getCommunityByIdSchema>;
export type TgetCommunitybyCode = z.infer<typeof getCommunitybyCodeSchema>;
export type TgetCommunityMembers = z.infer<typeof getCommunityMembersSchema>

export type TupdateCommunity = z.infer<typeof updateCommunitySchema>;
export type TupdateCommunityName = z.infer<typeof updateCommunityNameSchema>
export type TupdateCommunityBanner = z.infer<typeof updateCommunityBannerSchema>
export type TupdateCommunityDescription = z.infer<typeof updateCommunityDescriptionSchema>
export type TupdateCommunityRules = z.infer<typeof updateCommunityRulesSchema>

export type TdeleteCommunity = z.infer<typeof deleteCommunitySchema>;
export type TaddMember = z.infer<typeof addMemberSchema>;
export type TremoveMember = z.infer<typeof removeMemberSchema>
export type TupdateRole = z.infer<typeof updateRoleSchema>
export type TmakeAdmin = z.infer<typeof makeAdminSchema>
export type TexitCommunity = z.infer<typeof exitCommunitySchema>
export type TgetUserCommunities = z.infer<typeof getUserCommunitiesSchema>