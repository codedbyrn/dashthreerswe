"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/services/supabaseServer";
import {
  createInspirationSchema,
  updateInspirationSchema,
  createInspirationCategorySchema,
  Inspiration,
  Category,
} from "@/types/inspirationType";

// --- HELPERS ---

/**
 * Gets the ID of the 'inspirations' type from the type table.
 */
async function getInspirationsTypeId(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from("type")
    .select("id")
    .eq("type", "inspirations")
    .single();

  if (error || !data) {
    // If not found, look for any case variation or fallback
    const { data: list } = await supabase.from("type").select("id, type");
    const found = list?.find((t: any) => t.type.toLowerCase() === "inspirations");
    if (found) return found.id;
    
    // If still not found, throw error to alert seeding is needed
    throw new Error("The 'inspirations' row does not exist in the 'type' table. Please seed types first.");
  }

  return data.id;
}

// --- SERVER ACTIONS ---

/**
 * Fetches a list of inspirations with filtering, search, and pagination.
 */
export async function getInspirations(options: {
  categoryId?: string;
  favoriteOnly?: boolean;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}): Promise<{ inspirations: Inspiration[]; totalCount: number; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { inspirations: [], totalCount: 0, error: "Unauthorized" };
    }

    const {
      categoryId = "all",
      favoriteOnly = false,
      search = "",
      sortBy = "description_asc",
      limit = 10,
      offset = 0,
    } = options;

    let query = supabase
      .from("inspirations")
      .select(
        `
        id,
        img,
        description,
        category_id,
        url,
        favorite,
        category:category_id (
          id,
          category,
          type_id
        )
      `,
        { count: "exact" }
      );

    // Apply Filters
    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    if (favoriteOnly) {
      query = query.eq("favorite", true);
    }

    if (search.trim()) {
      query = query.or(`description.ilike.%${search}%,url.ilike.%${search}%`);
    }

    // Apply Sorting
    if (sortBy === "description_desc") {
      query = query.order("description", { ascending: false });
    } else {
      // Default: alphabetical/description ascending
      query = query.order("description", { ascending: true });
    }

    // Apply Pagination Range
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Database query error:", error);
      return { inspirations: [], totalCount: 0, error: error.message };
    }

    const inspirations: Inspiration[] = (data || []).map((item: any) => {
      const cat = Array.isArray(item.category) ? item.category[0] : item.category;
      return {
        id: item.id,
        img: item.img,
        description: item.description,
        category_id: item.category_id,
        url: item.url,
        favorite: !!item.favorite,
        category: cat
          ? {
              id: cat.id,
              category: cat.category,
              type_id: cat.type_id,
            }
          : undefined,
      };
    });

    return {
      inspirations,
      totalCount: count || 0,
      error: null,
    };
  } catch (err: any) {
    console.error("getInspirations action failed:", err);
    return { inspirations: [], totalCount: 0, error: err.message || "Server Error" };
  }
}

/**
 * Fetches a single inspiration by ID.
 */
export async function getInspirationById(id: string): Promise<{ inspiration: Inspiration | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { inspiration: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("inspirations")
      .select(`
        id,
        img,
        description,
        category_id,
        url,
        favorite,
        category:category_id (
          id,
          category,
          type_id
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return { inspiration: null, error: error?.message || "Inspiration not found" };
    }

    const cat = Array.isArray(data.category) ? data.category[0] : data.category;
    const inspiration: Inspiration = {
      id: data.id,
      img: data.img,
      description: data.description,
      category_id: data.category_id,
      url: data.url,
      favorite: !!data.favorite,
      category: cat
        ? {
            id: cat.id,
            category: cat.category,
            type_id: cat.type_id,
          }
        : undefined,
    };

    return { inspiration, error: null };
  } catch (err: any) {
    return { inspiration: null, error: err.message || "Server Error" };
  }
}

/**
 * Creates a new inspiration.
 */
export async function createInspiration(input: any): Promise<{ inspiration: Inspiration | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { inspiration: null, error: "Unauthorized" };
    }

    // Server-side Zod validation
    const validation = createInspirationSchema.safeParse(input);
    if (!validation.success) {
      return {
        inspiration: null,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const validatedData = validation.data;

    const { data, error } = await supabase
      .from("inspirations")
      .insert({
        img: validatedData.img || null,
        url: validatedData.url || null,
        category_id: validatedData.category_id,
        description: validatedData.description || null,
        favorite: validatedData.favorite ?? false,
      })
      .select()
      .single();

    if (error) {
      return { inspiration: null, error: error.message };
    }

    revalidatePath("/dashboard/inspirations");
    return { inspiration: data as Inspiration, error: null };
  } catch (err: any) {
    return { inspiration: null, error: err.message || "Server Error" };
  }
}

/**
 * Updates an existing inspiration.
 */
export async function updateInspiration(
  id: string,
  input: any
): Promise<{ inspiration: Inspiration | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { inspiration: null, error: "Unauthorized" };
    }

    // Server-side Zod validation
    const validation = updateInspirationSchema.safeParse(input);
    if (!validation.success) {
      return {
        inspiration: null,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const validatedData = validation.data;

    const { data, error } = await supabase
      .from("inspirations")
      .update({
        ...(validatedData.img !== undefined && { img: validatedData.img }),
        ...(validatedData.url !== undefined && { url: validatedData.url }),
        ...(validatedData.category_id !== undefined && { category_id: validatedData.category_id }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.favorite !== undefined && { favorite: validatedData.favorite }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { inspiration: null, error: error.message };
    }

    revalidatePath("/dashboard/inspirations");
    return { inspiration: data as Inspiration, error: null };
  } catch (err: any) {
    return { inspiration: null, error: err.message || "Server Error" };
  }
}

/**
 * Deletes an inspiration.
 */
export async function deleteInspiration(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase.from("inspirations").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/inspirations");
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Server Error" };
  }
}

/**
 * Toggles the favorite status of an inspiration.
 */
export async function toggleFavorite(id: string, currentStatus: boolean): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("inspirations")
      .update({ favorite: !currentStatus })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/inspirations");
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Server Error" };
  }
}

/**
 * Fetches all categories associated with the inspirations type.
 */
export async function getCategories(): Promise<{ categories: Category[]; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { categories: [], error: "Unauthorized" };
    }

    const typeId = await getInspirationsTypeId(supabase);

    const { data, error } = await supabase
      .from("category")
      .select("id, category, type_id")
      .eq("type_id", typeId)
      .order("category", { ascending: true });

    if (error) {
      return { categories: [], error: error.message };
    }

    return { categories: data as Category[], error: null };
  } catch (err: any) {
    return { categories: [], error: err.message || "Server Error" };
  }
}

/**
 * Creates a new category dynamically and links it to the 'inspirations' type.
 */
export async function createCategory(categoryName: string): Promise<{ category: Category | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { category: null, error: "Unauthorized" };
    }

    const typeId = await getInspirationsTypeId(supabase);

    // Validate using Zod
    const validation = createInspirationCategorySchema.safeParse({
      category: categoryName,
      type_id: typeId,
    });

    if (!validation.success) {
      return {
        category: null,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    // Check if category already exists for this type
    const { data: existing } = await supabase
      .from("category")
      .select("id, category, type_id")
      .eq("type_id", typeId)
      .ilike("category", categoryName.trim())
      .maybeSingle();

    if (existing) {
      return { category: existing as Category, error: null };
    }

    const { data, error } = await supabase
      .from("category")
      .insert({
        category: categoryName.trim(),
        type_id: typeId,
      })
      .select()
      .single();

    if (error) {
      return { category: null, error: error.message };
    }

    revalidatePath("/dashboard/inspirations");
    return { category: data as Category, error: null };
  } catch (err: any) {
    return { category: null, error: err.message || "Server Error" };
  }
}
