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

export interface Tool {
  id: string;
  title: string;
  category_id: string;
  url: string;
  favorite: boolean;
  category?: Category;
}

// --- Zod Validation Schemas ---

export const createToolSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  url: z
    .string()
    .min(1, "URL is required")
    .url("Invalid URL format (must start with http:// or https://)"),
  category_id: z
    .string()
    .uuid("Invalid category ID format"),
  favorite: z
    .boolean()
    .optional()
    .default(false),
});

export const updateToolSchema = createToolSchema.partial();

export const createToolCategorySchema = z.object({
  category: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  type_id: z
    .string()
    .uuid("Invalid type ID format"),
});

// --- Types derived from Zod Schemas ---

export type CreateToolInput = z.infer<typeof createToolSchema>;
export type UpdateToolInput = z.infer<typeof updateToolSchema>;
export type CreateToolCategoryInput = z.infer<typeof createToolCategorySchema>;
