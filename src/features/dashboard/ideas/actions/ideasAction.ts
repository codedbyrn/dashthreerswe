"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/services/supabaseServer";
import {
  createIdeaSchema,
  updateIdeaSchema,
  createIdeaCategorySchema,
  Idea,
  Category,
} from "@/types/ideaType";

// --- HELPERS ---

/**
 * Gets the ID of the 'ideas' type from the type table.
 */
async function getIdeasTypeId(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from("type")
    .select("id")
    .eq("type", "ideas")
    .single();

  if (error || !data) {
    // If not found, look for any case variation or fallback
    const { data: list } = await supabase.from("type").select("id, type");
    const found = list?.find((t: any) => t.type.toLowerCase() === "ideas");
    if (found) return found.id;
    
    // If still not found, throw error to alert seeding is needed
    throw new Error("The 'ideas' row does not exist in the 'type' table. Please seed types first.");
  }

  return data.id;
}

// --- SERVER ACTIONS ---

/**
 * Fetches a list of ideas with filtering, search, and pagination.
 */
export async function getIdeas(options: {
  categoryId?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}): Promise<{ ideas: Idea[]; totalCount: number; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { ideas: [], totalCount: 0, error: "Unauthorized" };
    }

    const {
      categoryId = "all",
      search = "",
      sortBy = "title_asc",
      limit = 10,
      offset = 0,
    } = options;

    let query = supabase
      .from("ideas")
      .select(
        `
        id,
        title,
        description,
        category_id,
        category:category (
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

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply Sorting
    if (sortBy === "title_desc") {
      query = query.order("title", { ascending: false });
    } else {
      // Default: title alphabetical ascending
      query = query.order("title", { ascending: true });
    }

    // Apply Pagination Range
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Database query error:", error);
      return { ideas: [], totalCount: 0, error: error.message };
    }

    const ideas: Idea[] = (data || []).map((item: any) => {
      const cat = Array.isArray(item.category) ? item.category[0] : item.category;
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        category_id: item.category_id,
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
      ideas,
      totalCount: count || 0,
      error: null,
    };
  } catch (err: any) {
    console.error("getIdeas action failed:", err);
    return { ideas: [], totalCount: 0, error: err.message || "Server Error" };
  }
}

/**
 * Fetches a single idea by ID.
 */
export async function getIdeaById(id: string): Promise<{ idea: Idea | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { idea: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("ideas")
      .select(`
        id,
        title,
        description,
        category_id,
        category:category (
          id,
          category,
          type_id
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return { idea: null, error: error?.message || "Idea not found" };
    }

    const cat = Array.isArray(data.category) ? data.category[0] : data.category;
    const idea: Idea = {
      id: data.id,
      title: data.title,
      description: data.description,
      category_id: data.category_id,
      category: cat
        ? {
            id: cat.id,
            category: cat.category,
            type_id: cat.type_id,
          }
        : undefined,
    };

    return { idea, error: null };
  } catch (err: any) {
    return { idea: null, error: err.message || "Server Error" };
  }
}

/**
 * Creates a new idea.
 */
export async function createIdea(input: any): Promise<{ idea: Idea | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { idea: null, error: "Unauthorized" };
    }

    // Server-side Zod validation
    const validation = createIdeaSchema.safeParse(input);
    if (!validation.success) {
      return {
        idea: null,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const validatedData = validation.data;

    const { data, error } = await supabase
      .from("ideas")
      .insert({
        title: validatedData.title,
        description: validatedData.description || null,
        category_id: validatedData.category_id,
      })
      .select()
      .single();

    if (error) {
      return { idea: null, error: error.message };
    }

    revalidatePath("/dashboard/ideas");
    return { idea: data as Idea, error: null };
  } catch (err: any) {
    return { idea: null, error: err.message || "Server Error" };
  }
}

/**
 * Updates an existing idea.
 */
export async function updateIdea(
  id: string,
  input: any
): Promise<{ idea: Idea | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { idea: null, error: "Unauthorized" };
    }

    // Server-side Zod validation
    const validation = updateIdeaSchema.safeParse(input);
    if (!validation.success) {
      return {
        idea: null,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const validatedData = validation.data;

    const { data, error } = await supabase
      .from("ideas")
      .update({
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.category_id !== undefined && { category_id: validatedData.category_id }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { idea: null, error: error.message };
    }

    revalidatePath("/dashboard/ideas");
    return { idea: data as Idea, error: null };
  } catch (err: any) {
    return { idea: null, error: err.message || "Server Error" };
  }
}

/**
 * Deletes a idea.
 */
export async function deleteIdea(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase.from("ideas").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/ideas");
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Server Error" };
  }
}

/**
 * Fetches all categories associated with the ideas type.
 */
export async function getCategories(): Promise<{ categories: Category[]; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { categories: [], error: "Unauthorized" };
    }

    const typeId = await getIdeasTypeId(supabase);

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
 * Creates a new category dynamically and links it to the 'ideas' type.
 */
export async function createCategory(categoryName: string): Promise<{ category: Category | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { category: null, error: "Unauthorized" };
    }

    const typeId = await getIdeasTypeId(supabase);

    // Validate using Zod
    const validation = createIdeaCategorySchema.safeParse({
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

    revalidatePath("/dashboard/ideas");
    return { category: data as Category, error: null };
  } catch (err: any) {
    return { category: null, error: err.message || "Server Error" };
  }
}
