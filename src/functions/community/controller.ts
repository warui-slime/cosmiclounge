import { FastifyRequest, FastifyReply } from '@shared/src/utils/export.js';
import { ApiResponse } from '@shared/src/utils/apiResponse.js';
import { 
  addMemberSchema,
  communityCreateSchema,
  deleteCommunitySchema,
  exitCommunitySchema,
  getCommunitybyCodeSchema,
  getCommunityByIdSchema,
  getCommunityMembersSchema,
  getUserCommunitiesSchema,
  makeAdminSchema,
  removeMemberSchema,
  TgetAllCommunities,
  updateCommunityBannerSchema,
  updateCommunityDescriptionSchema,
  updateCommunityNameSchema,
  updateCommunityRulesSchema,
  updateRoleSchema
} from '@shared/src/validators/community.validator.js';
import { CommunityService } from './service.js';

export class CommunityController {
  private communityService: CommunityService;
  
  constructor() {
    this.communityService = new CommunityService();
  }

  createCommunity = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user!.id;
    const { name, description, type, rules } = req.body as any;
    const validatedData = communityCreateSchema.parse({ userId, name, description, type, rules });
    const community = await this.communityService.createCommunity(validatedData);
    ApiResponse.success(reply, 201, 'Community created successfully', community);
  };

  getAllCommunities = async (req: FastifyRequest, reply: FastifyReply) => {
    
    
    const validatedData = req.query as TgetAllCommunities;
    const communities = await this.communityService.getAllCommunities(validatedData);
    ApiResponse.success(reply, 200, 'Communities fetched successfully', communities);
  };

  getCommunityById = async (req: FastifyRequest, reply: FastifyReply) => {
    const validatedData = getCommunityByIdSchema.parse({ communityId: (req.params as any).id });
    const community = await this.communityService.getCommunityById(validatedData);
    ApiResponse.success(reply, 200, 'Community details', community);
  };

  getCommunitybyCode = async (req: FastifyRequest, reply: FastifyReply) => {
    const validatedData = getCommunitybyCodeSchema.parse({ joinCode: (req.params as any).code });
    const community = await this.communityService.getCommunityByCode(validatedData);
    ApiResponse.success(reply, 200, 'Community details', community);
  };

  updateCommunityName = async (req: FastifyRequest, reply: FastifyReply) => {
    const updateData = req.body as any;
    const validatedData = updateCommunityNameSchema.parse({ userId: req.user!.id, ...updateData });
    await this.communityService.updateCommunityName(validatedData);
    ApiResponse.success(reply, 200, 'Community name updated successfully');
  };

  updateCommunityBanner = async (req: FastifyRequest, reply: FastifyReply) => {
    const updateData = req.body as any;
    const validatedData = updateCommunityBannerSchema.parse({ userId: req.user!.id, ...updateData });
    await this.communityService.updateCommunityBanner(validatedData);
    ApiResponse.success(reply, 200, 'Community banner updated successfully');
  };

  updateCommunityDescription = async (req: FastifyRequest, reply: FastifyReply) => {
    const updateData = req.body as any;
    const validatedData = updateCommunityDescriptionSchema.parse({ userId: req.user!.id, ...updateData });
    await this.communityService.updateCommunityDescription(validatedData);
    ApiResponse.success(reply, 200, 'Community description updated successfully');
  };

  updateCommunityRules = async (req: FastifyRequest, reply: FastifyReply) => {
    const updateData = req.body as any;
    const validatedData = updateCommunityRulesSchema.parse({ userId: req.user!.id, ...updateData });
    await this.communityService.updateCommunityRules(validatedData);
    ApiResponse.success(reply, 200, 'Community rules updated successfully');
  };

  deleteCommunity = async (req: FastifyRequest, reply: FastifyReply) => {
    const { communityId } = req.body as any;
    
    const validatedData = deleteCommunitySchema.parse({ 
      userId: req.user!.id, 
      communityId 
    });
    
    await this.communityService.deleteCommunity(validatedData);
    ApiResponse.success(reply, 204, 'Community deleted successfully');
  };

  addMember = async (req: FastifyRequest, reply: FastifyReply) => {
    const { joinCode } = req.body as any;
    const validatedData = addMemberSchema.parse({ 
      userId: req.user!.id, 
      joinCode 
    });
    const membership = await this.communityService.addMember(validatedData);
    ApiResponse.success(reply, 201, 'Joined community successfully', membership);
  };

  getCommunityMembers = async (req: FastifyRequest, reply: FastifyReply) => {
    const validatedData = getCommunityMembersSchema.parse(req.params);
    const members = await this.communityService.getCommunityMembers(validatedData);
    ApiResponse.success(reply, 200, 'Community members', members);
  };

  removeMember = async (req: FastifyRequest, reply: FastifyReply) => {
    const { communityId, userId } = req.body as any;
    const validatedData = removeMemberSchema.parse({ 
      communityId, 
      userId, 
      requesterId: req.user!.id 
    });
    await this.communityService.removeMember(validatedData);
    ApiResponse.success(reply, 200, 'Member has been removed');
  };

  updateMemberRole = async (req: FastifyRequest, reply: FastifyReply) => {
    const { communityId, userId, role } = req.body as any;
    const validatedData = updateRoleSchema.parse({ 
      communityId, 
      userId, 
      requesterId: req.user!.id, 
      role 
    });
    await this.communityService.updateRole(validatedData);
    ApiResponse.success(reply, 200, 'Role updated successfully');
  };

  makeAdmin = async (req: FastifyRequest, reply: FastifyReply) => {
    const { communityId, userId } = req.body as any;
    const validatedData = makeAdminSchema.parse({ 
      communityId, 
      userId, 
      requesterId: req.user!.id 
    });
    await this.communityService.makeAdmin(validatedData);
    ApiResponse.success(reply, 200, 'Role updated: moderator promoted to admin');
  };

  exitCommunity = async (req: FastifyRequest, reply: FastifyReply) => {
    const { communityId } = req.body as any;
    const validatedData = exitCommunitySchema.parse({ 
      communityId, 
      userId: req.user!.id 
    });
    await this.communityService.exitCommunity(validatedData);
    ApiResponse.success(reply, 200, 'Successfully exited community');
  };

  getUserCommunities = async (req: FastifyRequest, reply: FastifyReply) => {
    const validatedData = getUserCommunitiesSchema.parse({ 
      username: (req.params as any).username 
    });
    const communities = await this.communityService.getUserCommunities(validatedData);
    ApiResponse.success(reply, 200, "User's communities", communities);
  };
}