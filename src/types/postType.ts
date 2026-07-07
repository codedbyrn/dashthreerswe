import { z } from "zod";

// --- Database Table Types ---

export interface Type {
  id: string;
  type: string;
}

export interface Category {
  id: string;
  category: string;
  type_id: string;
  type?: Type;
}

export interface Post {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category_id: string;
  category?: Category;
}

// --- Zod Validation Schemas ---

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z
    .string()
    .nullable()
    .optional(),
  status: z
    .string()
    .min(1, "Status is required")
    .max(50, "Status must be 50 characters or less"),
  category_id: z
    .string()
    .uuid("Invalid category ID format"),
});

export const updatePostSchema = createPostSchema.partial();

export const createPostCategorySchema = z.object({
  category: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  type_id: z
    .string()
    .uuid("Invalid type ID format"),
});

// --- Types derived from Zod Schemas ---

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreatePostCategoryInput = z.infer<typeof createPostCategorySchema>;
