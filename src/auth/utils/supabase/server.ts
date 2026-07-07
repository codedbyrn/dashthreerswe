import { createServerClient } from "@supabase/ssr"; // استيراد الدالة لإنشاء عميل Supabase للسيرفر
import { cookies } from "next/headers"; // استيراد أداة التعامل مع الكوكيز من Next.js

// دالة لإنشاء العميل وإرجاعه للاستخدام لاحقاً في المكونات التي تعمل في السيرفر
export async function createClient() {
  // جلب مخزن الكوكيز (في النسخ الحديثة من Next.js يجب عمل await لـ cookies)
  const cookieStore = await cookies();

  // إنشاء وإرجاع عميل Supabase
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // رابط سيرفر Supabase الخاص بك والموجود في ملف البيئة
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // مفتاح الوصول العام الموجود في ملف البيئة
    {
      cookies: {
        // دالة للحصول على الكوكيز كلها
        getAll() {
          return cookieStore.getAll(); // إرجاع جميع الكوكيز المخزنة في المتصفح
        },
        // دالة لتعيين كل الكوكيز دفعة واحدة
        setAll(cookiesToSet) {
          try {
            // المرور على كل كوكي وتطبيقها باستخدام الحلقات
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options); // حفظ الكوكي في المتصفح بالاسم والقيمة والخيارات
            });
          } catch (error) {
            // تجاهل الخطأ في حالة أن الدالة تم استدعاؤها من مكان لا يسمح بتعديل الكوكيز (مثل Server Component)
            // لأن تحديث الكوكيز يتطلب بيئة تدعم كتابة الرؤوس (Headers) للمتصفح
          }
        },
      },
    }
  );
}

/**
 * مسؤول عن:

جلسة المستخدم داخل السيرفر
قراءة وكتابة Cookies
Server Actions
Server Components
Middleware

يستخدم:

signIn
signOut
getUser
حماية الصفحات
SSR Auth

يستخدم:

NEXT_PUBLIC_SUPABASE_ANON_KEY

لكن مع Session المستخدم الحقيقي.
 */
