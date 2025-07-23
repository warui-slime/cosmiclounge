import { FastifyInstance } from "fastify";
import {
  authResponseSchema,
  errorResponseSchema,
  loginSchema,
  signupSchema,
  TUserLogin,
  TUserSignup,
  userResponseSchema,
} from "cosmic/src/validators/auth.validator.js";
import { AuthService } from "./service.js";
import jwt from "jsonwebtoken";
import { AuthError } from "cosmic/src/errors/appError.js";

const authService = new AuthService();

const JWT_SECRET = process.env.JWT_SECRET!;
const isProduction = process.env.NODE_ENV === "production";

async function userAuth(fastify: FastifyInstance) {
  fastify.post<{ Body: TUserSignup }>(
    "/signup",
    {
      schema: {
        body: signupSchema,
        response: {
          201: userResponseSchema,
          400: errorResponseSchema,
          409: errorResponseSchema, // Conflict (duplicate)
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await authService.signup(request.body);

        // Convert Date to string for Zod validation
        const responseUser = {
          ...user,
          createdAt: user.createdAt.toISOString(),
        };

        return reply.code(201).send(responseUser);
      } catch (error) {
        // Centralized error handler will process this
        throw error;
      }
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

        // Convert Date to string
        // const responseUser = {
        //   ...result.user,
        //   createdAt: result.user.createdAt.toISOString(),
        //   lastLogin: result.user.lastLogin?.toISOString(), // Optional
        // };
        // 1) Create access token (short‑lived)
        // const accessToken = jwt.sign(
        //   { userId: responseUser.id, type: "access" },
        //   JWT_SECRET,
        //   { expiresIn: "15m" }
        // );

        // // 2) Create refresh token (longer‑lived)
        // const refreshToken = jwt.sign(
        //   { userId: responseUser.id, type: "refresh" },
        //   JWT_SECRET,
        //   { expiresIn: "14d" }
        // );

        // 3) Send both as HttpOnly cookies

        reply
          .setCookie("accessToken", result.tokens!.AccessToken!, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: result.tokens!.ExpiresIn!,
            path: "/"
          })
          .setCookie("refreshToken", result.tokens!.RefreshToken!, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: 14 * 24 * 60 * 60, // 14 days
            path: "/"
          })
          .code(200)
          .send({
            user: {
              ...result.user,
              createdAt: result.user.createdAt.toISOString(),
              lastLogin: result.user.lastLogin?.toISOString(),
            }
          });
      } catch (error) {
        throw error;
      }
    }
  );

  // fastify.post("/token/refresh", async (request, reply) => {
  //   const token = request.cookies.refreshToken;

  //   try {
  //     if (!token) throw new AuthError("No token found");
  //     const payload = jwt.verify(token, JWT_SECRET) as {
  //       userId: string;
  //       type: string;
  //     };
  //     if (payload.type !== "refresh")
  //       throw new AuthError("Invalid refresh token");

  //     const newAccess = jwt.sign(
  //       { userId: payload.userId, type: "access" },
  //       JWT_SECRET,
  //       { expiresIn: "15m" }
  //     );

  //     reply
  //       .setCookie("accessToken", newAccess, {
  //         httpOnly: true,
  //         secure: isProduction, // false in development
  //         sameSite: isProduction ? "strict" : "lax",
  //         maxAge: 15 * 60,
  //         path:'/'
  //       })
  //       .send({ success: true });
  //   } catch (error) {
  //     throw error;
  //   }
  // });
}
export default userAuth;
