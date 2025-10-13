
import { Service, ServiceType } from './types';

// Define a strict type for the entire appData object
interface AppData {
  company_info: {
    name_ar: string;
    name_en: string;
    description_ar: string;
    phone: string;
    whatsapp: string;
    payment_number: string;
    email: string;
    locations: string[];
    working_hours: string;
  };
  admin_credentials: {
    username: string;
    password: string;
  };
  services: Service[];
  config: {
    imgbb_api_key: string;
    whatsapp_number: string;
    payment_number: string;
    minimum_area: number;
    discount_percentage: number;
    advance_payment_percentage: number;
  };
}

// By using a typed constant, TypeScript can validate the entire structure.
export const appData: AppData = {
  company_info: {
    name_ar: "كلين ماستر",
    name_en: "Clean Master",
    description_ar: "رائد خدمات التنظيف في مصر - نقدم خدمات تنظيف احترافية للمنازل والشركات بأعلى معايير الجودة",
    phone: "01013373634",
    whatsapp: "201013373634",
    payment_number: "01013373634",
    email: "info@cleanmaster.com.eg",
    locations: ["القاهرة", "الجيزة", "الإسكندرية", "المنصورة", "أسيوط"],
    working_hours: "من 8 صباحاً حتى 10 مساءً - 7 أيام في الأسبوع"
  },
  admin_credentials: {
    username: "admin",
    password: "cleanmaster2024"
  },
  services: [
    {
      id: "mosque_carpets",
      name_ar: "غسيل سجاد المساجد",
      price: 7,
      type: "meter",
      description_ar: "خدمة غسيل وتنظيف سجاد المساجد بتقنيات متطورة وآمنة",
      icon: "fas fa-mosque",
      includes: ["غسيل عميق بالبخار", "تعقيم وتطهير", "إزالة البقع الصعبة", "تجفيف سريع"],
      video_url: "https://www.youtube.com/embed/P2-IZj-s3PI"
    },
    {
      id: "home_cleaning_regular",
      name_ar: "تنظيف المنازل العادي",
      price: 10,
      type: "meter",
      description_ar: "تنظيف شامل للمنازل يشمل جميع الغرف والمرافق",
      icon: "fas fa-home",
      includes: ["تنظيف جميع الغرف", "تنظيف الحمامات", "تنظيف المطبخ", "مسح الأرضيات"],
      video_url: "https://www.youtube.com/embed/jJzF-BTv-0o"
    },
    {
      id: "home_cleaning_deep",
      name_ar: "تنظيف المنازل العميق",
      price: 14,
      type: "meter",
      description_ar: "تنظيف معمق وشامل لجميع أجزاء المنزل",
      icon: "fas fa-home",
      includes: ["تنظيف عميق لجميع الأسطح", "تنظيف داخل الأجهزة", "تنظيف النوافذ", "تلميع الأثاث"],
      video_url: "https://www.youtube.com/embed/c6zt_s5gU0I"
    },
    {
      id: "post_construction",
      name_ar: "تنظيف بعد التشطيب",
      price: 13,
      type: "meter",
      description_ar: "تنظيف متخصص بعد أعمال التشطيب والبناء",
      icon: "fas fa-hard-hat",
      includes: ["إزالة أتربة البناء", "تنظيف بقايا الدهان", "تلميع الأرضيات", "تنظيف النوافذ"],
      video_url: "https://www.youtube.com/embed/y2l2F2DTs0k"
    },
    {
      id: "closed_places",
      name_ar: "تنظيف الاماكن المغلقة",
      price: 20,
      type: "meter",
      description_ar: "تنظيف الأماكن المغلقة لفترة طويلة",
      icon: "fas fa-door-closed",
      includes: ["إزالة الغبار المتراكم", "تعقيم شامل", "إزالة الروائح", "تهوية المكان"],
      video_url: "https://www.youtube.com/embed/sL9s9x7pW-I"
    },
    {
      id: "empty_apartment",
      name_ar: "تنظيف شقة فاضية",
      price: 12,
      type: "meter",
      description_ar: "تنظيف الشقق الفارغة قبل الانتقال",
      icon: "fas fa-building",
      includes: ["تنظيف شامل للشقة", "تنظيف الخزائن", "تلميع الأرضيات", "تنظيف التكييف"],
      video_url: "https://www.youtube.com/embed/kH8WbY80y-I"
    },
    {
      id: "painting_finishing",
      name_ar: "دهانات وتشطيب",
      price: 0,
      type: "consultation",
      description_ar: "خدمات الدهان والتشطيب (السعر بعد المعاينة)",
      icon: "fas fa-paint-roller",
      includes: ["معاينة مجانية", "استشارة فنية", "أفضل المواد", "ضمان على العمل"],
      video_url: "https://www.youtube.com/embed/m7w0-v7aJcI"
    },
    {
      id: "home_carpet",
      name_ar: "تنظيف موكيت المنازل",
      price: 10,
      type: "meter",
      description_ar: "تنظيف وغسيل موكيت المنازل بالبخار",
      icon: "fas fa-rug",
      includes: ["غسيل بالبخار", "إزالة البقع", "تجفيف سريع", "معطرات طبيعية"],
      video_url: "https://www.youtube.com/embed/QAU2e8G-0F4"
    },
    {
      id: "office_carpet",
      name_ar: "تنظيف موكيت المكاتب والشركات",
      price: 15,
      type: "meter",
      description_ar: "تنظيف موكيت المكاتب والشركات بتقنيات متطورة",
      icon: "fas fa-building",
      includes: ["تنظيف احترافي", "مواد آمنة", "عمل سريع", "جدولة مرنة"],
      video_url: "https://www.youtube.com/embed/J7VzZN4aY9g"
    },
    {
      id: "antique_sofa",
      name_ar: "تنظيف الانتريه",
      price: 350,
      type: "fixed",
      description_ar: "تنظيف وغسيل طقم الانتريه",
      icon: "fas fa-couch",
      includes: ["غسيل بالبخار", "تنظيف القماش", "إزالة البقع", "تعطير"],
      video_url: "https://www.youtube.com/embed/y-a9yI-iR0s"
    },
    {
      id: "salon_sofa",
      name_ar: "تنظيف الصالون",
      price: 350,
      type: "fixed",
      description_ar: "تنظيف وغسيل طقم الصالون",
      icon: "fas fa-couch",
      includes: ["تنظيف شامل", "غسيل القماش", "تلميع الخشب", "تعطير"],
      video_url: "https://www.youtube.com/embed/S_B7WCEsS-s"
    },
    {
      id: "small_corner",
      name_ar: "تنظيف ركنه صغيرة",
      price: 350,
      type: "fixed",
      description_ar: "تنظيف الركنة الصغيرة",
      icon: "fas fa-chair",
      includes: ["غسيل القماش", "تنظيف الإسفنج", "إزالة البقع", "تعطير"],
      video_url: "https://www.youtube.com/embed/lCPr_3-yeI4"
    },
    {
      id: "large_corner",
      name_ar: "تنظيف ركنه كبيرة",
      price: 85,
      type: "meter",
      description_ar: "تنظيف الركنة الكبيرة حسب المساحة",
      icon: "fas fa-chair",
      includes: ["تنظيف حسب الحجم", "غسيل شامل", "تجفيف سريع", "حماية القماش"],
      video_url: "https://www.youtube.com/embed/lCPr_3-yeI4"
    },
    {
      id: "lazy_boy",
      name_ar: "كرسي ليزى بوى",
      price: 150,
      type: "fixed",
      description_ar: "تنظيف كرسي ليزى بوى",
      icon: "fas fa-chair",
      includes: ["تنظيف القماش", "تنظيف الآلية", "تلميع الجلد", "تعطير"],
      video_url: "https://www.youtube.com/embed/bXmQyY2eWJ4"
    },
    {
      id: "large_mattress",
      name_ar: "تنظيف مرتبة كبيرة",
      price: 350,
      type: "fixed",
      description_ar: "تنظيف وتعقيم المرتبة الكبيرة",
      icon: "fas fa-bed",
      includes: ["تنظيف عميق", "تعقيم وتطهير", "إزالة الروائح", "تجفيف سريع"],
      video_url: "https://www.youtube.com/embed/u_Fz7d-a16I"
    },
    {
      id: "small_mattress",
      name_ar: "تنظيف مرتبة صغيرة",
      price: 250,
      type: "fixed",
      description_ar: "تنظيف وتعقيم المرتبة الصغيرة",
      icon: "fas fa-bed",
      includes: ["تنظيف شامل", "تعقيم", "إزالة البقع", "تعطير"],
      video_url: "https://www.youtube.com/embed/u_Fz7d-a16I"
    },
    {
      id: "dining_chair",
      name_ar: "تنظيف كرسي سفرة",
      price: 50,
      type: "fixed",
      description_ar: "تنظيف كرسي السفرة",
      icon: "fas fa-chair",
      includes: ["تنظيف القماش", "تلميع الخشب", "إزالة البقع", "تعطير"],
      video_url: "https://www.youtube.com/embed/V-bS0s5-y6s"
    },
    {
      id: "large_curtain",
      name_ar: "تنظيف ستارة كبيرة",
      price: 200,
      type: "fixed",
      description_ar: "تنظيف وغسيل الستارة الكبيرة",
      icon: "fas fa-home",
      includes: ["غسيل دقيق", "كي احترافي", "إزالة البقع", "حماية القماش"],
      video_url: "https://www.youtube.com/embed/yCj2f_MLt8M"
    },
    {
      id: "small_curtain",
      name_ar: "تنظيف ستارة صغيرة",
      price: 150,
      type: "fixed",
      description_ar: "تنظيف وغسيل الستارة الصغيرة",
      icon: "fas fa-home",
      includes: ["غسيل احترافي", "كي مثالي", "إزالة الأتربة", "تعطير"],
      video_url: "https://www.youtube.com/embed/yCj2f_MLt8M"
    },
    {
      id: "large_rug",
      name_ar: "سجادة كبيرة",
      price: 150,
      type: "fixed",
      description_ar: "تنظيف وغسيل السجادة الكبيرة",
      icon: "fas fa-rug",
      includes: ["غسيل بالبخار", "إزالة البقع العنيدة", "تجفيف سريع", "معطرات طبيعية"],
      video_url: "https://www.youtube.com/embed/rVZyAAM4i4A"
    },
    {
      id: "small_rug",
      name_ar: "سجادة صغيرة",
      price: 99,
      type: "fixed",
      description_ar: "تنظيف وغسيل السجادة الصغيرة",
      icon: "fas fa-rug",
      includes: ["تنظيف شامل", "إزالة الأوساخ", "تجفيف سريع", "تعطير"],
      video_url: "https://www.youtube.com/embed/rVZyAAM4i4A"
    }
  ],
  config: {
    imgbb_api_key: "bde613bd4475de5e00274a795091ba04",
    whatsapp_number: "201013373634",
    payment_number: "01013373634",
    minimum_area: 100,
    discount_percentage: 10,
    advance_payment_percentage: 25
  }
};
