"use server"

import { createClient } from "../utils/supabase/server"; 

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { validateEmail, validatePassword } from "../utils/validation"

// Simple rate limit (replace with Redis in production)
// const rateLimits = new Map<string, number>()
// const MAX_ATTEMPTS = 5



// function checkRateLimit(key: string) {
//   const count = rateLimits.get(key) || 0
//   if (count >= MAX_ATTEMPTS) {
//     return "محاولات عديدة. حاول لاحقاً"
//   }
//   rateLimits.set(key, count + 1)
//   return null
// }

// function clearRateLimit(key: string) {
//   rateLimits.delete(key)
// }



//**** signIn:  دالة تسجيل الدخول

const rateLimits = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 دقيقة قفل مؤقت

function checkRateLimit(identifier: string) {
  const now = Date.now();
  const record = rateLimits.get(identifier);

  if (record) {
    if (now - record.lastAttempt < LOCKOUT_TIME) {
      if (record.count >= MAX_ATTEMPTS) {
        const remainingMinutes = Math.ceil((LOCKOUT_TIME - (now - record.lastAttempt)) / 60000);
        return `تم تجاوز الحد الأقصى للمحاولات. الحساب مقفول مؤقتاً. يرجى المحاولة بعد ${remainingMinutes} دقيقة.`;
      }
      record.count += 1;
      record.lastAttempt = now;
    } else {
      // إعادة تعيين إذا مر الوقت
      record.count = 1;
      record.lastAttempt = now;
    }
  } else {
    rateLimits.set(identifier, { count: 1, lastAttempt: now });
  }
  return null;
}

function clearRateLimit(identifier: string) {
  rateLimits.delete(identifier);
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string; // استخراج البريد الإلكتروني من حقول النموذج المرسل
  const password = formData.get("password") as string; // استخراج كلمة المرور من حقول النموذج المرسل

  // -------------------------
  // 1. Rate limit
  // -------------------------
  const rateLimitError = checkRateLimit(email);
  if (rateLimitError) return { error: rateLimitError };

  // تحقق مبدئي للشكل الصحيح لعنوان البريد المنطقي
  const emailError = validateEmail(email);
  if (emailError) return { error: emailError }; // إرجاع رسالة خطأ إذا كان البريد غير صالح

  // فحص تواجد كلمة المرور لضمان عدم إرسال طلب أخرق للسيرفر
  if (!password) return { error: "كلمة المرور مطلوبة" };

  const supabase = await createClient(); // تهيئة عميل الاتصال بسوبابيس

  // محاولة تسجيل الدخول للمستخدم عبر Supabase باستخدام الإيميل وكلمة السر
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // في حالة فشل التسجيل (مثل إدخال كلمة سر خاطئة أو إيميل غير مسجل)، يتم إرجاع الرسالة ليتم عرضها في الواجهة
  if (error) {
    return { error: error.message === "Invalid login credentials" ? "بيانات الدخول غير صحيحة" : error.message };
  }

  // التحقق من حالة تفعيل الحساب
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", user.id)
      .single();
      console.log("******************")
      console.log("******************"+ user)
      console.log("******************"+ user.email)
      console.log("******************")

    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      return { error: "تم إيقاف هذا الحساب. يرجى التواصل مع الإدارة." };
    }
  }

  // نجاح الدخول -> تصفير عداد المحاولات
  clearRateLimit(email);

  // بعد نجاح الدخول بنجاح، نقوم بمسح مسارات الكاش وتحديث الصفحة الرئيسية
  revalidatePath("/", "layout"); /* يقول لـ Next.js: "امسح الكاش وأعد بناء الصفحات لأن حالة المستخدم تغيرت" */
  redirect("/dashboard/users"); // التوجيه الفوري لصفحة البروفايل المحمية الخاصه بالعميل أو الأدمن
}

//**** signOut: 
// دالة لإنهاء جلسة المستخدم وتسجيل خروجه نهائياً
export async function signOut() {
  const supabase = await createClient(); // إنشاء العميل مع الكوكيز

  await supabase.auth.signOut(); // إنهاء الجلسة التابعة للمستخدم على جانب السيرفر ومسح كوكيز المصادقة من المتصفح

  revalidatePath("/", "layout"); // مسح كاش المسار المعروض حالياً لتنظيف أي بيانات حساسة
  redirect("/signin"); // التوجيه لصفحة تسجيل الدخول لغلق النافذة أمامه
}


// ==========================================
// Forgot Password & Reset Password
// ==========================================

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  // Rate Limiting
  const rateLimitError = checkRateLimit(`reset_${email}`);
  if (rateLimitError) return { error: rateLimitError };

  const emailError = validateEmail(email);
  if (emailError) return { error: emailError };

  const supabase = await createClient();

  // URL to redirect the user back to (must be configured in Supabase Redirect URLs)
  // The magic link token will be verified, then the user is sent to /reset-password
  // Next.js headers or hardcoded URL for deployment. Usually process.env.NEXT_PUBLIC_SITE_URL.
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
    : 'http://localhost:3000/reset-password';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email rate limit exceeded") || msg.includes("rate limit"))
      return { error: "لقد تجاوزت الحد المسموح به لإرسال البريد. يرجى الانتظار قليلاً ثم المحاولة مجدداً." };
    return { error: error.message };
  }

  clearRateLimit(`reset_${email}`);
  return { success: "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني بنجاح (صالح لمدة 24 ساعة)." };
}

export async function updatePassword(formData: FormData) {
  const newPassword = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { error: "كلمات المرور غير متطابقة" };
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) return { error: passwordError };

  const supabase = await createClient();

  // يتم تحديث كلمة المرور للمستخدم المسجل الدخول حاليا (أو الذي تم تسجيل دخوله عبر رابط الـ reset السري)
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("auth session missing"))
      return { error: "انتهت صلاحية الجلسة. يرجى طلب رابط إعادة التعيين مجدداً." };
    if (msg.includes("same password") || msg.includes("password should be different"))
      return { error: "كلمة المرور الجديدة يجب أن تختلف عن كلمة المرور الحالية." };
    return { error: error.message };
  }

  return { success: "تم تحديث كلمة المرور بنجاح. يمكنك الآن استخدام النظام بأمان." };
}
