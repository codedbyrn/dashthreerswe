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

export interface Inspiration {
  id: string;
  img: string | null;
  description: string | null;
  category_id: string;
  url: string | null;
  favorite: boolean;
  category?: Category;
}

// --- Zod Validation Schemas ---

export const createInspirationSchema = z.object({
  img: z
    .string()
    .url("Invalid image URL format")
    .nullable()
    .optional()
    .or(z.literal("")), // Allows empty string or null
  url: z
    .string()
    .url("Invalid URL format (must start with http:// or https://)")
    .nullable()
    .optional()
    .or(z.literal("")), // Allows empty string or null
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

export const updateInspirationSchema = createInspirationSchema.partial();

export const createInspirationCategorySchema = z.object({
  category: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  type_id: z
    .string()
    .uuid("Invalid type ID format"),
});

// --- Types derived from Zod Schemas ---

export type CreateInspirationInput = z.infer<typeof createInspirationSchema>;
export type UpdateInspirationInput = z.infer<typeof updateInspirationSchema>;
export type CreateInspirationCategoryInput = z.infer<typeof createInspirationCategorySchema>;
