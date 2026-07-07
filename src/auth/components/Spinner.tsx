import React from 'react'; // استيراد مكتبة رياكت الأساسية

// مكون مؤشر التحميل الدوار البسيط المصمم باستخدام Tailwind CSS
// هذا المكون لا يستقبل أي خصائص ويعرض فقط دائرة تدور للفت انتباه المستخدم أن هناك عميلة جارية
export default function Spinner() {
  return (
    // العنصر الرئيسي المحتوي على شكل الدائرة، نستخدم الفئات من تيلويند لتحويله لعلامة تحميل دائمة الدوران عبر animate-spin
    // و flex لتوسيطه في المنتصف
    <div className="flex justify-center items-center">
      {/* رسم الدائرة بقوة 2 بكسل وحواف دائرية ولون نيلي جذاب */}
      {/* <div className="mr-3 size-5 animate-spin  border-b-2 border-[#F8EEE4]"></div> */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F8EEE4]"></div>
    </div>
  );
}
