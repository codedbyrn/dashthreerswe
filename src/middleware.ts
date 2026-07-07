import { createServerClient } from "@supabase/ssr"; // استيراد دالة إنشاء العميل للميدل وير (الذي يعمل كحارس على السيرفر قبل إكمال الطلب)
import { NextResponse, type NextRequest } from "next/server"; // استيراد أنواع الطلبات والاستجابات للتوجيه الآمن من نكست
// دالة الميدل وير الرئيسية التي تتعقب كل الصفحات والمسارات المعرفة بالأسفل
export async function middleware(request: NextRequest) {
  console.log("🔥 MIDDLEWARE HIT:", request.nextUrl.pathname);

  // إنشاء استجابة مبدئية والتي سيتم إرسالها إن لم تتغير، مع إبقاء الرؤوس كما هي
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // إنشاء عميل Supabase خاص بالميدل وير لضمان فك تشفير الكوكيز والتحقق من الجلسة
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },

    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && (path.startsWith('/crud') || path.startsWith('/dashboard'))) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (user && (path.startsWith('/signin') || path.startsWith('/forgot-password') || path.startsWith('/reset-password'))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    user &&
    (
      path.startsWith('/crud') ||
      path.startsWith('/dashboard')
    )
  ) {
    // بما أنها مسارات مقصورة بأدوار محددة، نُحضر دور المستخدم وحالة نشاطه من جدول profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active') // نجلب عمود الـ role و is_active
      .eq('id', user.id) // بشرط مطابقة المعرف id مع معرف المستخدم الحالي
      .single(); // نتوقع نتيجة واحدة فقط

    console.log("USER ID:", user.id);
    console.log("PROFILE:", profile);
    // console.log("ERROR:", error);
    const role = profile?.role; // استخراج الدور بشكل سهل
    const isActive = profile?.is_active;

    // إذا كان الحساب غير نشط، نقوم بتسجيل الخروج الفوري والتوجيه لصفحة الدخول
    if (profile && isActive === false) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    // حماية صفحة إدارة المستخدمين للمشرفين الخارقين فقط
    if (path.startsWith('/dashboard/users') && role !== 'superuser') {
      console.log(role)
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (path.startsWith('/crud/products') && (role !== 'staff' && role !== 'superuser')) {
      // توجيه لصفحة الرفض لعدم امتلاك الصلاحيات
      return NextResponse.redirect(new URL("/", request.url));
    }

    // ب) التحقق من مسار /clientAdmin المخصص "فقط وحصرياً" للـ staff
    if (path.startsWith('/clientAdmin') && role !== 'staff') {
      // الرفض والتوجيه
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // في حال اجتاز المستخدم جميع الحواجز بأمان، نسمح بمرور الاستجابة وتحميل الصفحة المرجوة بشكل طبيعي
  return response;
}

// إعداد ملف التكوين (config) لتحديد المسارات التي ينشط بها الميدل وير ويعمل عليها
export const config = {
  // هذا التعبير النمطي يعني "راقب جميع المسارات باستثناء" ملفات النظام، الصور المشحونة، ومجلدات static
  // مما يوفر استهلاك الكثير من موارد السيرفر والميدل وير
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
