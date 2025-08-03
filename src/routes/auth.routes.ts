import { FastifyInstance } from "fastify";
import {
  authResponseSchema,
  errorResponseSchema,
  loginSchema,
  signupSchema,
  TUserLogin,
  TUserSignup,
  TConfirmSignup,
  userResponseSchema,
  confirmSchema,
  signupResponseSchema,
} from "../validators/auth.validator.js";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

const isProduction = process.env.NODE_ENV === "production";

async function userAuth(fastify: FastifyInstance) {
  fastify.post<{ Body: TUserSignup }>(
    "/signup",
    {
      schema: {
        body: signupSchema,
        response: {
          201: signupResponseSchema,
          400: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await authService.signup(request.body);

        // const responseUser = {
        //   ...user,
        //   createdAt: user.createdAt.toISOString(),
        // };

        return reply
          .code(201)
          .send({ message: "Confirmation code sent to email." });
      } catch (error) {
        throw error;
      }
    }
  );
  
  
   fastify.post<{
    Body: TConfirmSignup;
  }>(
    "/confirm-signup",
    {
      schema: {
        body: confirmSchema,
        response: {
          200: userResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const { email, username, confirmationCode } = req.body;
      const dbUser = await authService.confirmSignup(
       { email,
        username,
        confirmationCode}
      );

      return reply.code(200).send({
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        createdAt: dbUser.createdAt.toISOString(),
      });
    }
  );

  fastify.post<{ Body: TUserLogin }>(
    "/login",
    {
      schema: {
        body: loginSchema,
        response: {
          200: authResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await authService.login(request.body);

        reply
          .setCookie("accessToken", result.tokens!.AccessToken!, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: result.tokens!.ExpiresIn!,
            path: "/",
          })
          .setCookie("refreshToken", result.tokens!.RefreshToken!, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: 14 * 24 * 60 * 60, //14d
            path: "/",
          })
          .code(200)
          .send({
            user: {
              ...result.user,
              createdAt: result.user.createdAt.toISOString(),
              lastLogin: result.user.lastLogin?.toISOString(),
            },
          });
      } catch (error) {
        throw error;
      }
    }
  );
}
export default userAuth;
