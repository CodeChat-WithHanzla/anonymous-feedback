import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be atleast 2 characters long ")
  .max(20, "Username must be no longer than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special character");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid Email Address." }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters." })
});
