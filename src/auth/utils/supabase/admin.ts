import { createClient } from "@supabase/supabase-js"

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)


/**مسؤول عن:

العمليات الإدارية الخطيرة
يستخدم SERVICE_ROLE_KEY
يتجاوز RLS
يعمل على السيرفر فقط

يستخدم لـ:

إنشاء مستخدم
حذف مستخدم
تعديل roles
إدارة الأكواد والاشتراكات
 */