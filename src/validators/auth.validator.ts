import { z } from "zod/v4";



export const signupSchema = z.object({
  username: z.string()
});



export const signupResponseSchema = z.object({
  message: z.string(),
});


export const userResponseSchema = z.object({
  id: z.cuid().optional(),
  username: z.string(),
  email: z.email(),
  createdAt: z.iso.datetime(),
  lastLogin: z.iso.datetime().optional(),
});

export const authResponseSchema = z.object({
  user: userResponseSchema,
});

export const errorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  errorCode: z.string().optional(), // Add errorCode

  stack: z.string().optional(),

  errors: z
    .array(
      // Add errors array for validation details
      z.object({
        path: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});



export type TUserSignup = z.infer<typeof signupSchema>;
export type TSignupResponse = z.infer<typeof signupResponseSchema>;
