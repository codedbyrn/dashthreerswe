"use server";

import { supabaseAdmin } from "../utils/supabase/admin";
import { createClient } from "../utils/supabase/server";
import { revalidatePath } from "next/cache";
import { validateEmail, validatePassword } from "../utils/validation";

// دالة التحقق من أن المستخدم الحالي هو superuser ونشط
async function verifySuperuser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("غير مصرح بالعملية. الرجاء تسجيل الدخول أولاً.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "superuser" || !profile.is_active) {
    throw new Error("صلاحيات غير كافية. هذه العملية مخصصة للمشرفين فقط.");
  }

  return user;
}

// 1. إنشاء موظف جديد
export async function createEmployee(formData: FormData) {
  try {
    await verifySuperuser();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || "staff";

    // التحقق من صحة المدخلات
    const emailError = validateEmail(email);
    if (emailError) return { error: emailError };

    const passwordError = validatePassword(password);
    if (passwordError) return { error: passwordError };

    if (role !== "superuser" && role !== "staff") {
      return { error: "الدور المحدد غير صالح." };
    }

    // إنشاء الحساب في Supabase Auth باستخدام صلاحيات الأدمن
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      return { error: authError?.message || "فشل إنشاء مستخدم جديد في النظام." };
    }

    const userId = authData.user.id;

    // إنشاء البروفايل الخاص بالموظف في قاعدة البيانات
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        role,
        is_active: true,
      });
    // const { error: profileError } = await supabaseAdmin
    //   .from("profiles")
    //   .insert({
    //     id: userId,
    //     role,
    //     is_active: true,
    //   });

    console.log("PROFILE ERROR:", JSON.stringify(profileError, null, 2));[]

    if (profileError) {
      // رول باك: حذف الحساب من Auth في حال فشل إدخال البروفايل
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { error: profileError.message };
    }

    revalidatePath("/dashboard/users");
    return { success: "تم إنشاء حساب الموظف بنجاح." };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ غير متوقع." };
  }
}

// 2. تعديل بيانات الموظف
export async function updateEmployee(
  userId: string,
  email: string,
  role: "superuser" | "staff",
  isActive: boolean
) {
  try {
    const currentUser = await verifySuperuser();

    // منع الأدمن من تعديل أو تعطيل حسابه الخاص منعاً للمشاكل
    if (currentUser.id === userId) {
      return { error: "لا يمكنك تعديل صلاحياتك أو حالتك من هنا لتجنب إغلاق النظام." };
    }

    const emailError = validateEmail(email);
    if (emailError) return { error: emailError };

    if (role !== "superuser" && role !== "staff") {
      return { error: "الدور المحدد غير صالح." };
    }

    // تحديث البريد الإلكتروني في Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email }
    );

    if (authError) {
      return { error: authError.message || "فشل تحديث البريد الإلكتروني للموظف." };
    }

    // تحديث البيانات في جدول profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        role,
        is_active: isActive,
      })
      .eq("id", userId);

    if (profileError) {
      return { error: profileError.message || "فشل تحديث ملف الموظف." };
    }

    revalidatePath("/dashboard/users");
    return { success: "تم تحديث بيانات الموظف بنجاح." };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ غير متوقع." };
  }
}

// 3. تغيير حالة نشاط الموظف (تفعيل / إيقاف)
export async function toggleEmployeeStatus(userId: string, isActive: boolean) {
  try {
    const currentUser = await verifySuperuser();

    if (currentUser.id === userId) {
      return { error: "لا يمكنك تعديل حالة حسابك الخاص." };
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", userId);

    if (error) {
      return { error: error.message || "فشل تعديل حالة الموظف." };
    }

    revalidatePath("/dashboard/users");
    return { success: isActive ? "تم تفعيل الحساب بنجاح." : "تم إيقاف الحساب بنجاح." };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ غير متوقع." };
  }
}

// 4. حذف الموظف نهائياً
export async function deleteEmployee(userId: string) {
  try {
    const currentUser = await verifySuperuser();

    if (currentUser.id === userId) {
      return { error: "لا يمكنك حذف حسابك الخاص." };
    }

    // حذف المستخدم من Supabase Auth (سيقوم بحذف البروفايل تلقائياً بفضل Cascade Delete)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return { error: error.message || "فشل حذف المستخدم من النظام." };
    }

    revalidatePath("/dashboard/users");
    return { success: "تم حذف حساب الموظف نهائياً من النظام." };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ غير متوقع." };
  }
}
