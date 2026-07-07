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
  // Optional join field : علامة ? تعني أن الحقل اختياري.
  type?: Type;
}
/* 
ex: {
  id:"1",
  category:"React",
  type_id:"10",

  type:{
      id:"10",
      type:"Frontend"
  }
}
*/

export interface Resource {
  id: string;
  title: string;
  category_id: string;
  url: string;
  description: string | null;
  favorite: boolean;
  // Optional join field
  category?: Category;
}

// --- Zod Validation Schemas ---

export const createResourceSchema = z.object({
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
  description: z
    .string()
    .nullable()
    .optional(),
  favorite: z
    .boolean()
    .optional()
    .default(false),
});

export const updateResourceSchema = createResourceSchema.partial();

export const createCategorySchema = z.object({
  category: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  type_id: z
    .string()
    .uuid("Invalid type ID format"),
});

// --- Types derived from Zod Schemas ---

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
