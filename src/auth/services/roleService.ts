"use server"; 
// توجيه يدل على أن هذه الدوال تعمل على السيرفر فقط ولا ترسل للكلاينت لتأمين العمليات

import { createClient } from "../utils/supabase/server"; 
// استيراد دالة السيرفر لإنشاء عميل Supabase الخاص بك

// دالة لجلب دور المستخدم (Role) من جدول profiles بطريقة آمنة
export async function getUserRole() {
  const supabase = await createClient(); // إنشاء الاتصال بقاعدة البيانات مع تجهيز كوكيز الجلسة الحالية

  try {
    // جلب معلومات المستخدم الحالي المسجل دخوله عبر دالة getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // إذا لم يكن هناك مستخدم مسجل الدخول، نرجع قيمة خالية للإشارة لعدم الصلاحية
    if (!user) return null;

    // استعلام لجلب حقل role من جدول profiles حيث يتطابق id مع id المستخدم الحالي
    // الدالة .single() تضمن إرجاع كائن واحد (صف واحد) من الجدول فقط بدلاً من مصفوفة لتسهيل التعامل معه
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
  
    // في حال حدوث خطأ أثناء الاستعلام في قاعدة البيانات، يتم طباعته في السجل وإرجاع قيمة فارغة
    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    // إرجاع الدور المكتشف (والذي قد يكون superuser أو staff أو client)
    return data?.role || null;
  } catch (err) {
    // التقاط أي أخطاء برمجية غير متوقعة (مثل فقدان الاتصال بقاعدة البيانات بشكل كلي)
    console.error("Unexpected error in getUserRole:", err);
    return null;
  }
}
