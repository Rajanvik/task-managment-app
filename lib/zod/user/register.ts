import { z } from "zod";

export const ZRegister = z.object({
  name: z.string().min(1, { message: "Name is required." }).optional(),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export type TRegister = z.infer<typeof ZRegister>;
