"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/services/supabaseServer";
import {
  createPostSchema,
  updatePostSchema,
  createPostCategorySchema,
  Post,
  Category,
} from "@/types/postType";

// --- HELPERS ---

/**
 * Gets the ID of the 'posts' type from the type table.
 */
async function getPostsTypeId(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from("type")
    .select("id")
    .eq("type", "posts")
    .single();

  if (error || !data) {
    // If not found, look for any case variation or fallback
    const { data: list } = await supabase.from("type").select("id, type");
    const found = list?.find((t: any) => t.type.toLowerCase() === "posts");
    if (found) return found.id;
    
    // If still not found, throw error to alert seeding is needed
    throw new Error("The 'posts' row does not exist in the 'type' table. Please seed types first.");
  }

  return data.id;
}

// --- SERVER ACTIONS ---

/**
 * Fetches a list of posts with filtering, search, and pagination.
 */
export async function getPosts(options: {
  categoryId?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}): Promise<{ posts: Post[]; totalCount: number; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { posts: [], totalCount: 0, error: "Unauthorized" };
    }

    const {
      categoryId = "all",
      status = "all",
      search = "",
      sortBy = "title_asc",
      limit = 10,
      offset = 0,
    } = options;

    let query = supabase
      .from("posts")
      .select(
        `
        id,
        title,
        description,
        status,
        category_id,
        category:category (
          id,
          category,
          type_id
        )
      `,
        { count: "exact" }
      );

    // Apply Category Filter
    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    // Apply Status Filter
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Apply Search Filter (on title or description)
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
      return { posts: [], totalCount: 0, error: error.message };
    }

    const posts: Post[] = (data || []).map((item: any) => {
      const cat = Array.isArray(item.category) ? item.category[0] : item.category;
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status || "Draft",
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
      posts,
      totalCount: count || 0,
      error: null,
    };
  } catch (err: any) {
    console.error("getPosts action failed:", err);
    return { posts: [], totalCount: 0, error: err.message || "Server Error" };
  }
}

/**
 * Fetches a single post by ID.
 */
export async function getPostById(id: string): Promise<{ post: Post | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { post: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        description,
        status,
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
      return { post: null, error: error?.message || "Post not found" };
    }

    const cat = Array.isArray(data.category) ? data.category[0] : data.category;
    const post: Post = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status || "Draft",
      category_id: data.category_id,
      category: cat
        ? {
            id: cat.id,
            category: cat.category,
            type_id: cat.type_id,
          }
        : undefined,
    };

    return { post, error: null };
  } catch (err: any) {
    return { post: null, error: err.message || "Server Error" };
  }
}

/**
 * Creates a new post.
 */
export async function createPost(input: any): Promise<{ post: Post | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { post: null, error: "Unauthorized" };
    }

    // Server-side Zod validation
    const validation = createPostSchema.safeParse(input);
    if (!validation.success) {
      return {
        post: null,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const validatedData = validation.data;

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: validatedData.title,
        description: validatedData.description || null,
        status: validatedData.status,
        category_id: validatedData.category_id,
      })
      .select()
      .single();

    if (error) {
      return { post: null, error: error.message };
    }

    revalidatePath("/dashboard/posts");
    return { post: data as Post, error: null };
  } catch (err: any) {
    return { post: null, error: err.message || "Server Error" };
  }
}

/**
 * Updates an existing post.
 */
export async function updatePost(
  id: string,
  input: any
): Promise<{ post: Post | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { post: null, error: "Unauthorized" };
    }

    // Server-side Zod validation
    const validation = updatePostSchema.safeParse(input);
    if (!validation.success) {
      return {
        post: null,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const validatedData = validation.data;

    const { data, error } = await supabase
      .from("posts")
      .update({
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.status !== undefined && { status: validatedData.status }),
        ...(validatedData.category_id !== undefined && { category_id: validatedData.category_id }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { post: null, error: error.message };
    }

    revalidatePath("/dashboard/posts");
    return { post: data as Post, error: null };
  } catch (err: any) {
    return { post: null, error: err.message || "Server Error" };
  }
}

/**
 * Deletes a post.
 */
export async function deletePost(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/posts");
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Server Error" };
  }
}

/**
 * Fetches all categories associated with the posts type.
 */
export async function getCategories(): Promise<{ categories: Category[]; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { categories: [], error: "Unauthorized" };
    }

    const typeId = await getPostsTypeId(supabase);

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
 * Creates a new category dynamically and links it to the 'posts' type.
 */
export async function createCategory(categoryName: string): Promise<{ category: Category | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { category: null, error: "Unauthorized" };
    }

    const typeId = await getPostsTypeId(supabase);

    // Validate using Zod
    const validation = createPostCategorySchema.safeParse({
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

    revalidatePath("/dashboard/posts");
    return { category: data as Category, error: null };
  } catch (err: any) {
    return { category: null, error: err.message || "Server Error" };
  }
}
