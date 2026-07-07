"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/services/supabaseServer";
import {
  createResourceSchema,
  updateResourceSchema,
  createCategorySchema,
  Resource,
  Category,
} from "@/types/resourceType";

// --- HELPERS ---

/**
 * Gets the ID of the 'resources' type from the type table.
 */
async function getResourcesTypeId(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from("type")
    .select("id")
    .eq("type", "resources")
    .single();

  if (error || !data) {
    // If not found, look for any case variation or fallback
    const { data: list } = await supabase.from("type").select("id, type");
    const found = list?.find((t: any) => t.type.toLowerCase() === "resources");
    if (found) return found.id;
    
    // If still not found, throw error to alert seeding is needed
    throw new Error("The 'resources' row does not exist in the 'type' table. Please seed types first.");
  }

  return data.id;
}

// --- SERVER ACTIONS ---

/**
 * Fetches a list of resources with filtering, search, and pagination.
 */
export async function getResources(options: {
  categoryId?: string;
  favoriteOnly?: boolean;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}): Promise<{ resources: Resource[]; totalCount: number; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { resources: [], totalCount: 0, error: "Unauthorized" };
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
      .from("resources")
      .select(
        `
        id,
        title,
        category_id,
        url,
        description,
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
      return { resources: [], totalCount: 0, error: error.message };
    }

    const resources: Resource[] = (data || []).map((item: any) => {
      const cat = Array.isArray(item.category) ? item.category[0] : item.category;
      return {
        id: item.id,
        title: item.title,
        category_id: item.category_id,
        url: item.url,
        description: item.description,
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
      resources,
      totalCount: count || 0,
      error: null,
    };
  } catch (err: any) {
    console.error("getResources action failed:", err);
    return { resources: [], totalCount: 0, error: err.message || "Server Error" };
  }
}

/**
 * Fetches a single resource by ID.
 */
export async function getResourceById(id: string): Promise<{ resource: Resource | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { resource: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("resources")
      .select(`
        id,
        title,
        category_id,
        url,
        description,
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
      return { resource: null, error: error?.message || "Resource not found" };
    }

    const cat = Array.isArray(data.category) ? data.category[0] : data.category;
    const resource: Resource = {
      id: data.id,
      title: data.title,
      category_id: data.category_id,
      url: data.url,
      description: data.description,
      favorite: !!data.favorite,
      category: cat
        ? {
            id: cat.id,
            category: cat.category,
            type_id: cat.type_id,
          }
        : undefined,
    };

    return { resource, error: null };
  } catch (err: any) {
    return { resource: null, error: err.message || "Server Error" };
  }
}

/**
 * Creates a new resource.
 */
export async function createResource(input: any): Promise<{ resource: Resource | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { resource: null, error: "Unauthorized" };
    }

    // Server-side Zod validation
    const validation = createResourceSchema.safeParse(input);
    if (!validation.success) {
      return {
        resource: null,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const validatedData = validation.data;

    const { data, error } = await supabase
      .from("resources")
      .insert({
        title: validatedData.title,
        category_id: validatedData.category_id,
        url: validatedData.url,
        description: validatedData.description || null,
        favorite: validatedData.favorite ?? false,
      })
      .select()
      .single();

    if (error) {
      return { resource: null, error: error.message };
    }

    revalidatePath("/dashboard/resources");
    return { resource: data as Resource, error: null };
  } catch (err: any) {
    return { resource: null, error: err.message || "Server Error" };
  }
}

/**
 * Updates an existing resource.
 */
export async function updateResource(
  id: string,
  input: any
): Promise<{ resource: Resource | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { resource: null, error: "Unauthorized" };
    }

    // Server-side Zod validation
    const validation = updateResourceSchema.safeParse(input);
    if (!validation.success) {
      return {
        resource: null,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const validatedData = validation.data;

    const { data, error } = await supabase
      .from("resources")
      .update({
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.category_id !== undefined && { category_id: validatedData.category_id }),
        ...(validatedData.url !== undefined && { url: validatedData.url }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.favorite !== undefined && { favorite: validatedData.favorite }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { resource: null, error: error.message };
    }

    revalidatePath("/dashboard/resources");
    return { resource: data as Resource, error: null };
  } catch (err: any) {
    return { resource: null, error: err.message || "Server Error" };
  }
}

/**
 * Deletes a resource.
 */
export async function deleteResource(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase.from("resources").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/resources");
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Server Error" };
  }
}

/**
 * Toggles the favorite status of a resource.
 */
export async function toggleFavorite(id: string, currentStatus: boolean): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("resources")
      .update({ favorite: !currentStatus })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/resources");
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Server Error" };
  }
}

/**
 * Fetches all categories associated with the resources type.
 */
export async function getCategories(): Promise<{ categories: Category[]; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { categories: [], error: "Unauthorized" };
    }

    const typeId = await getResourcesTypeId(supabase);

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
 * Creates a new category dynamically and links it to the 'resources' type.
 */
export async function createCategory(categoryName: string): Promise<{ category: Category | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { category: null, error: "Unauthorized" };
    }

    const typeId = await getResourcesTypeId(supabase);

    // Validate using Zod
    const validation = createCategorySchema.safeParse({
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

    revalidatePath("/dashboard/resources");
    return { category: data as Category, error: null };
  } catch (err: any) {
    return { category: null, error: err.message || "Server Error" };
  }
}
