import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const issueCreateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categorySlug: z.string().min(1, "Category is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  landmark: z.string().optional(),
  wardId: z.string().optional(),
  departmentId: z.string().optional(),
});

export const statusChangeSchema = z.object({
  status: z.string().min(1),
  note: z.string().optional(),
});

export const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000),
});

export const verificationSchema = z.object({
  verified: z.boolean(),
  note: z.string().optional(),
});
