"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/services/supabaseServer";
import {
  createToolSchema,
  updateToolSchema,
  createToolCategorySchema,
  Tool,
  Category,
} from "@/types/toolType";

// --- HELPERS ---

/**
 * Gets the ID of the 'tools' type from the type table.
 */
async function getToolsTypeId(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from("type")
    .select("id")
    .eq("type", "tools")
    .single();

  if (error || !data) {
    // If not found, look for any case variation or fallback
    const { data: list } = await supabase.from("type").select("id, type");
    const found = list?.find((t: any) => t.type.toLowerCase() === "tools");
    if (found) return found.id;
    
    // If still not found, throw error to alert seeding is needed
    throw new Error("The 'tools' row does not exist in the 'type' table. Please seed types first.");
  }

  return data.id;
}

// --- SERVER ACTIONS ---

/**
 * Fetches a list of tools with filtering, search, and pagination.
 */
export async function getTools(options: {
  categoryId?: string;
  favoriteOnly?: boolean;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}): Promise<{ tools: Tool[]; totalCount: number; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { tools: [], totalCount: 0, error: "Unauthorized" };
    }

    const {
      categoryId = "all",
      favoriteOnly = false,
      search = "",
      sortBy = "title_asc",
      limit = 10,
      offset = 0,
    } = options;

    let query = supabase
      .from("tools")
      .select(
        `
        id,
        title,
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
      query = query.or(`title.ilike.%${search}%,url.ilike.%${search}%`);
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
      return { tools: [], totalCount: 0, error: error.message };
    }

    const tools: Tool[] = (data || []).map((item: any) => {
      const cat = Array.isArray(item.category) ? item.category[0] : item.category;
      return {
        id: item.id,
        title: item.title,
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
      tools,
      totalCount: count || 0,
      error: null,
    };
  } catch (err: any) {
    console.error("getTools action failed:", err);
    return { tools: [], totalCount: 0, error: err.message || "Server Error" };
  }
}

/**
 * Fetches a single tool by ID.
 */
export async function getToolById(id: string): Promise<{ tool: Tool | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { tool: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("tools")
      .select(`
        id,
        title,
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
      return { tool: null, error: error?.message || "Tool not found" };
    }

    const cat = Array.isArray(data.category) ? data.category[0] : data.category;
    const tool: Tool = {
      id: data.id,
      title: data.title,
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

    return { tool, error: null };
  } catch (err: any) {
    return { tool: null, error: err.message || "Server Error" };
  }
}

/**
 * Creates a new tool.
 */
export async function createTool(input: any): Promise<{ tool: Tool | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { tool: null, error: "Unauthorized" };
    }

    // Server-side Zod validation
    const validation = createToolSchema.safeParse(input);
    if (!validation.success) {
      return {
        tool: null,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const validatedData = validation.data;

    const { data, error } = await supabase
      .from("tools")
      .insert({
        title: validatedData.title,
        url: validatedData.url,
        category_id: validatedData.category_id,
        favorite: validatedData.favorite ?? false,
      })
      .select()
      .single();

    if (error) {
      return { tool: null, error: error.message };
    }

    revalidatePath("/dashboard/tools");
    return { tool: data as Tool, error: null };
  } catch (err: any) {
    return { tool: null, error: err.message || "Server Error" };
  }
}

/**
 * Updates an existing tool.
 */
export async function updateTool(
  id: string,
  input: any
): Promise<{ tool: Tool | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { tool: null, error: "Unauthorized" };
    }

    // Server-side Zod validation
    const validation = updateToolSchema.safeParse(input);
    if (!validation.success) {
      return {
        tool: null,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const validatedData = validation.data;

    const { data, error } = await supabase
      .from("tools")
      .update({
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.url !== undefined && { url: validatedData.url }),
        ...(validatedData.category_id !== undefined && { category_id: validatedData.category_id }),
        ...(validatedData.favorite !== undefined && { favorite: validatedData.favorite }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { tool: null, error: error.message };
    }

    revalidatePath("/dashboard/tools");
    return { tool: data as Tool, error: null };
  } catch (err: any) {
    return { tool: null, error: err.message || "Server Error" };
  }
}

/**
 * Deletes a tool.
 */
export async function deleteTool(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase.from("tools").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/tools");
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Server Error" };
  }
}

/**
 * Toggles the favorite status of a tool.
 */
export async function toggleFavorite(id: string, currentStatus: boolean): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("tools")
      .update({ favorite: !currentStatus })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/tools");
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Server Error" };
  }
}

/**
 * Fetches all categories associated with the tools type.
 */
export async function getCategories(): Promise<{ categories: Category[]; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { categories: [], error: "Unauthorized" };
    }

    const typeId = await getToolsTypeId(supabase);

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
 * Creates a new category dynamically and links it to the 'tools' type.
 */
export async function createCategory(categoryName: string): Promise<{ category: Category | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { category: null, error: "Unauthorized" };
    }

    const typeId = await getToolsTypeId(supabase);

    // Validate using Zod
    const validation = createToolCategorySchema.safeParse({
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

    revalidatePath("/dashboard/tools");
    return { category: data as Category, error: null };
  } catch (err: any) {
    return { category: null, error: err.message || "Server Error" };
  }
}
