import React from "react";
import { createClient } from "@/auth/utils/supabase/server";
import { supabaseAdmin } from "@/auth/utils/supabase/admin";
import { redirect } from "next/navigation";
import UserManagementClient from "./UserManagementClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const supabase = await createClient();

  // 1. Securely check current user identity and active admin role on server-side
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect("/signin");
  }

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", currentUser.id)
    .single();

  if (!actorProfile || actorProfile.role !== "superuser" || !actorProfile.is_active) {
    redirect("/");
  }

  // 2. Fetch all user accounts from Auth and profiles and merge them for administrative overview.
  // Using Admin Client API because auth.users is protected on database RLS.
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  });

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("*");

  const usersList = (authData?.users || []).map((user) => {
    const profile = (profiles || []).find((p) => p.id === user.id);
    return {
      id: user.id,
      email: user.email || "",
      role: profile?.role || "staff",
      is_active: profile?.is_active ?? true,
      created_at: profile?.created_at || user.created_at,
    };
  });

  return (
    <div className="w-full">
      <UserManagementClient 
        initialUsers={usersList} 
        currentUserId={currentUser.id} 
      />
    </div>
  );
}
