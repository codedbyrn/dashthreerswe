import { createBrowserClient } from "@supabase/ssr"; // استيراد الدالة لإنشاء عميل Supabase للمتصفح (الكلاينت)

export function createClient() {
  // إنشاء وإرجاع عميل المتصفح
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}


/**
 * مسؤول عن:

الاتصال بـ Supabase داخل المتصفح
Client Components
realtime
onClick
useEffect

يستخدم:

جلب بيانات مباشرة
الاستماع لتغير auth
تفاعل المستخدم

ويعتمد على Session الموجودة في المتصفح.
 */