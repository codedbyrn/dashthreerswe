"use client"; // دلالة على أن هذا المكون يتم تنفيذه في المتصفح فقط (Client-side)

import React, { createContext, useEffect, useState } from "react"; // استيراد دوال ومكتبات React الأساسية
import { createClient } from "../utils/supabase/client"; // استيراد عميل قاعدة البيانات الخاص بالمتصفح
import { getUserRole } from "../services/roleService"; // استيراد دالة جلب الدور التي أنشأناها كـ Server Action

// تعريف واجهة (Interface) لنوع البيانات المخزنة في السياق
interface AuthContextType {
  user: any | null; // بيانات المستخدم الأساسية (من Auth)، وقد تكون فارغة في حالة عدم التسجيل
  role: string | null; // دور المستخدم (superuser, staff, client, anonymous) أو فارغ
  loading: boolean; // متغير لتحديد حالة التحميل لجعل واجهة المستخدم تتفاعل (مثل عرض Spinner)
}

// إنشاء سياق المصادقة مع إعطائه قيمة افتراضية
const AuthContext = createContext<AuthContextType>({
  user: null, // لا يوجد مستخدم بالبداية
  role: null, // لا يوجد دور بالبداية
  loading: true, // التحميل يعمل في البداية حتى نتأكد من حالة الجلسة
});

// مكون مزود السياق الذي سيحيط بالتطبيق أو الأجزاء التي تحتاج للمصادقة وتوزيع بياناتها
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null); // حالة للمستخدم لمعرفة هويته وبريده
  const [role, setRole] = useState<string | null>(null); // حالة الدور الخاص به للتحقق من صلاحياته
  const [loading, setLoading] = useState(true); // حالة مؤشر التحميل منعاً لوميض الشاشة البشع قبل جلب البيانات
  
  const supabase = createClient(); // تشغيل الكلاينت الخاص بـ Supabase للعمل في المتصفح

  useEffect(() => {
    // دالة غير متزامنة للتحقق المبدئي من جلسة المستخدم عند تحميل الصفحة أول مرة
    const fetchSession = async () => {
      try {
        // طلب الجلسة الحالية المخزنة في الكوكيز
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user); // حفظ المستخدم في حالة التواجد
          
          // استدعاء اجراء خادم لمعرفة دوره بشكل آمن عبر قاعدة البيانات (جدول Profiles)
          const userRole = await getUserRole();
          setRole(userRole); // تعيين الدور
        }
      } catch (error) {
        console.error("Auth check failed", error); // طباعة الخطأ المخفي للمطور ليسهل تتبعه
      } finally {
        setLoading(false); // وقف مؤشر التحميل بكل الحالات حتى يُعرض الموقع للمستخدم
      }
    };

    fetchSession(); // أمر بتنفيذ الدالة فوراً

    // الاشتراك في تغيرات حالة المصادقة (مثلاً عندما يسجل الدخول بصفحة، أو يسجل الخروج في تبويبة أخرى فتحدث هذه الصفحة آلياً)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          // إذا كانت الحالة تسجيل خروج نزيل كل البيانات من الذاكرة لضمان الخصوصية
          setUser(null);
          setRole(null);
        } else if (session?.user) {
          // في حال تسجيل الدخول الفعلي (أو تحديث البيانات)، نحدث المستخدم والدور الجديد كلياً
          setUser(session.user);
          const userRole = await getUserRole();
          setRole(userRole);
        }
        setLoading(false); // إخفاء علامة التحميل مجدداً
      }
    );

    // دالة تنظيف (Cleanup) لإيقاف المستمع عند إزالة هذا المكون لمنع استهلاك الذاكرة (Memory Leaks)
    return () => {
      authListener.subscription.unsubscribe(); // إنهاء الاشتراك بالحدث
    };
  }, [supabase.auth]); // المصفوفة تحتوي على التبعيات الخاصة بالهوك

  // إرسال القيم للمكونات الأبناء بحيث يمكن استهلاك بياناتنا من أي ملف يحيط به هذا المزود
  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; // تصدير الكونتكست كالعنصر الأساسي في الملف
