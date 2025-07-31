import { z } from "zod/v4";

export const usernameValidation = z
  .string()
  .min(2, "Username must be atleast 2 characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters");

export const signupSchema = z.object({
  username: usernameValidation,
  email: z.email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  identifier: z.string(),
  password: z
    .string()
    .min(6, { message: "password must be atleast 6 characters" }),
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

export const confirmSchema = z.object({
  email: z.email(),
  username: usernameValidation,
  confirmationCode: z.string().min(6, "Confirmation code must be at least 6 characters"),
});

export type TUserSignup = z.infer<typeof signupSchema>;
export type TUserLogin = z.infer<typeof loginSchema>;
export type TConfirmSignup = z.infer<typeof confirmSchema>;