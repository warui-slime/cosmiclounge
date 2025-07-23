import { FastifyInstance } from "fastify";
import { CommunityController } from "./controller.js";
import { verifyToken } from "cosmic/src/middleware/auth.middleware.js";
import { deleteCommunitySchema, getAllCommunitiesSchema } from "cosmic/src/validators/community.validator.js";

export default async function communityRoutes(fastify: FastifyInstance) {
  const communityController = new CommunityController();

  fastify.register(async (fastify) => {
    fastify.addHook("preHandler", verifyToken);

    // Community CRUD
    fastify.post("/create", communityController.createCommunity);

    fastify.get(
      "/fetch",
      {
        schema: {
          querystring: getAllCommunitiesSchema,
        },
      },
      communityController.getAllCommunities
    );

    fastify.get("/:id", communityController.getCommunityById);
    fastify.get("/joincode/:code", communityController.getCommunitybyCode);

    // Community Updates
    fastify.patch("/update/name", communityController.updateCommunityName);
    fastify.patch("/update/banner", communityController.updateCommunityBanner);
    fastify.patch(
      "/update/description",
      communityController.updateCommunityDescription
    );
    fastify.patch("/update/rules", communityController.updateCommunityRules);

    fastify.delete("/delete",communityController.deleteCommunity);

    // Membership
    fastify.post("/join", communityController.addMember);
    fastify.get(
      "/:communityId/members",
      communityController.getCommunityMembers
    );
    fastify.delete("/member/kick", communityController.removeMember);

    // Roles
    fastify.patch("/makeadmin", communityController.makeAdmin);
    fastify.patch("/updaterole", communityController.updateMemberRole);
    fastify.delete("/member/exit", communityController.exitCommunity);

    // User Communities
    fastify.get("/user/:username", communityController.getUserCommunities);
  });
}
