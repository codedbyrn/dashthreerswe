import { useContext } from "react"; // استيراد دالة استخدام السياقات أو الـ Context الخاصة برياكت
import AuthContext from "../context/AuthContext"; // استيراد سياق المصادقة الذي أنشأناه للتو

// خطاف مخصص (Custom Hook) يسهل عملية استيراد واستخدام بيانات المصادقة في أي مكون داخلي بكل سهولة
export const useAuth = () => {
  // نستورد القيمة الحالية للسياق الخاص بنا
  const context = useContext(AuthContext);

  // إذا تم وضع الخطاف في مكان لا يحيط به AuthProvider خارج التطبيق أو في ترتيب غير صحيح، نطبع رسالة خطأ واضحة للمطور
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider. لقد نسيت تغليف التطبيق بالـ Provider");
  }

  // إرجاع الخصائص المرجوة (شاملة المستخدم الحالي، دوره، وإذا ما كان النظام يحمل البيانات أم لا)
  return context;
};
