import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password is required"),
});

export const signUpSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(3, "Display name is required")
    .max(100, "Display name must be 100 characters or less"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be 100 characters or less"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;