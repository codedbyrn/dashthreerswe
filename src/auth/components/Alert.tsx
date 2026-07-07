import React from 'react'; // استيراد مكتبة رياكت

// واجهة خصائص المكون لتمرير رسالة الخطأ أو النجاح
interface AlertProps {
  message: string; // الرسالة النصية المراد إظهارها
  type?: 'error' | 'success'; // نوع التنبيه لتحديد اللون الافتراضي (وهو error في أغلب الأحيان)
}

// مكون التنبيه المخصص لرسائل الانتباه لعرض رسالة واضحة للمستخدم
export default function Alert({ message, type = 'error' }: AlertProps) {
  // تفريغ المكون في حال لم يتم تمرير أي رسالة له (إرجاع null يمنع ظهوره تماماً من المعالجة في المتصفح)
  if (!message) return null;

  // تحديد خلفية المكون بناءً على نوع رسالة الخطأ (أحمر للخطأ والأخضر للنجاح)
  const bgColor = type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
  // تحديد لون حافة يسار المربع
  const borderColor = type === 'error' ? 'border-red-400' : 'border-green-400';

  return (
    // تنسيق حاوية التنبيه مع إضافة حواف ملونة واللون المناسب له والمحاذاة المريحة للعين
    <div className={`border-l-4 p-4 mb-4 ${bgColor} ${borderColor} rounded-r-md`} role="alert">
      {/* طباعة الرسالة بالخط العريض */}
      <p className="font-medium">{message}</p>
    </div>
  );
}
