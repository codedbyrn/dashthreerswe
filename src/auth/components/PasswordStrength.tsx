"use client"; // تحديد أن هذا المكون يتم تشغيله على جانب العميل حصراً لأنه يتفاعل باستمرار مع كتابة المستخدم

import React, { useState, useEffect } from "react"; // استيراد دوال الحالة والتحديث من رياكت

// واجهة تعريف خاصية كلمة السر الممررة للمكون
interface PasswordStrengthProps {
  password: string; // كلمة المرور التي يكتبها المستخدم الآن وسيتم تمريرها من المكون الرئيسي (الفورم)
}

// مكون بصري يقوم بتقييم مدى قوة كلمة المرور خطوة بخطوة لمساعدة المستخدم على بناء كلمة سر قوية توافق الشروط
export default function PasswordStrength({ password }: PasswordStrengthProps) {
  // سلسلة من الحالات (States) لتمثيل مدى توفر كل شرط على حدة (القيمة المبدئية دائماً فولس)
  const [lengthCheck, setLengthCheck] = useState(false);
  const [upperCheck, setUpperCheck] = useState(false);
  const [lowerCheck, setLowerCheck] = useState(false);
  const [numberCheck, setNumberCheck] = useState(false);
  const [specialCheck, setSpecialCheck] = useState(false);

  // دالة useEffect تُراقب أي تغيير في قيمة المتغير (password) ليتم تحديث مؤشرات القوة بالوقت الفعلي فور الكتابة
  useEffect(() => {
    // تحديث كل حالة بنتيجة الشرط (ترجع ترو إذا وافقت الكلمة التعبير النمطي، وإلا فولس)
    setLengthCheck(password.length >= 9); // هل تحتوي على 9 أحرف على الأقل؟
    setUpperCheck(/[A-Z]/.test(password)); // هل يوجد حرف إنجليزي واحد كبير على الأقل؟
    setLowerCheck(/[a-z]/.test(password)); // هل يوجد حرف إنجليزي واحد صغير على الأقل؟
    setNumberCheck(/\d/.test(password)); // هل توجد أي أرقام هنا؟
    setSpecialCheck(/[!@#$%^&*(),.?":{}|<>]/.test(password)); // هل اختار رمز معقد وخاص؟
  }, [password]); // مصفوفة التبعيات تراقب تغير السلسلة النصية password فقط

  // دالة مساعدة لتحديد اللون المناسب لكل سطر في المكون بناء على صحة الشرط ليتحول للأخضر فور تحقيقه بدلاً من الرمادي
  const getColor = (passed: boolean) => (passed ? "text-[#9ea86c]" : "text-gray-400");

  return (
    <div className="mt-3 text-sm" dir="rtl">

      <ul className="space-y-1.5 flex flex-col items-start">
        {/* بناء سطر لكل شرط واعطائه أيقونة دائرة فارغة إذا كان خاطئاً، وعلامة صح إذا تحقق */}
        <li className={`${getColor(lengthCheck)} flex items-center transition-colors duration-300 font-bold text-xs`}>
           <span className="ml-2 ">{lengthCheck ? "✓" : "○"}</span> 9 أحرف على الأقل
        </li>
        <li className={`${getColor(upperCheck)} flex items-center transition-colors duration-300 font-bold text-xs`}>
          <span className="ml-2">{upperCheck ? "✓" : "○"}</span> حرف إنجليزي كبير (Uppercase)
        </li>
        <li className={`${getColor(lowerCheck)} flex items-center transition-colors duration-300 font-bold text-xs`}>
          <span className="ml-2">{lowerCheck ? "✓" : "○"}</span> حرف إنجليزي صغير (Lowercase)
        </li>
        <li className={`${getColor(numberCheck)} flex items-center transition-colors duration-300 font-bold text-xs`}>
          <span className="ml-2">{numberCheck ? "✓" : "○"}</span> رقم واحد على الأقل
        </li>
        <li className={`${getColor(specialCheck)} flex items-center transition-colors duration-300 font-bold text-xs`}>
          <span className="ml-2">{specialCheck ? "✓" : "○"}</span> رمز خاص (مثل @، #، $)
        </li>
      </ul>
    </div>
  );
}
