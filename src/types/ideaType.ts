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

export interface Idea {
  id: string;
  title: string;
  description: string | null;
  category_id: string;
  category?: Category;
}

// --- Zod Validation Schemas ---

export const createIdeaSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z
    .string()
    .nullable()
    .optional(),
  category_id: z
    .string()
    .uuid("Invalid category ID format"),
});

export const updateIdeaSchema = createIdeaSchema.partial();

export const createIdeaCategorySchema = z.object({
  category: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  type_id: z
    .string()
    .uuid("Invalid type ID format"),
});

// --- Types derived from Zod Schemas ---

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;
export type CreateIdeaCategoryInput = z.infer<typeof createIdeaCategorySchema>;
