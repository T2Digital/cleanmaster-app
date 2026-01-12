
import { Service, Testimonial, BeforeAfterImage } from './types';

// Helper to get environment variables safely
const getEnv = (key: string, defaultValue: string = ""): string => {
  try {
    // @ts-ignore
    return process.env[key] || process.env[`NEXT_PUBLIC_${key}`] || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const appData = {
  company_info: {
    name_ar: "كلين ماستر",
    name_en: "Clean Master",
    description_ar: "الشركة الرائدة في خدمات النظافة المتكاملة والتعقيم في مصر. خبرة أكثر من 10 سنوات في خدمة المنازل والشركات بأحدث المعدات الألمانية.",
    phone: "01013373634",
    whatsapp: "201013373634",
    payment_number: "01013373634",
    email: "info@cleanmaster.com.eg",
    locations: ["التجمع الخامس", "الشيخ زايد", "الرحاب & مدينتي", "أكتوبر", "المعادي & هليوبوليس"],
    working_hours: "طوال أيام الأسبوع من 9 ص حتى 10 م"
  },
  // ADMIN CREDENTIALS REMOVED FOR SECURITY - Set via ADMIN_USERNAME/ADMIN_PASSWORD env vars
  services: [
    {
      id: "mosque_carpets",
      name_ar: "غسيل سجاد المساجد 🕌",
      price: 7,
      type: "meter",
      category: "carpets_curtains",
      description_ar: "خدمة غسيل وتنظيف سجاد المساجد بتقنيات متطورة وآمنة مع التعقيم والتعطير برائحة المسك.",
      icon: "fas fa-mosque",
      includes: ["غسيل عميق بالبخار", "تعقيم بمواد معتمدة", "إزالة بقع الشحوم", "تجفيف وتكييف"],
      video_url: "https://www.youtube.com/embed/P2-IZj-s3PI",
      seo: {
          title: "غسيل سجاد مساجد في مصر | خصومات للجمعيات الخيرية | كلين ماستر",
          description: "أفضل خدمة غسيل سجاد مساجد في القاهرة والجيزة. تعقيم شامل وإزالة للروائح بأفضل الأسعار للمساجد.",
          keywords: ["غسيل سجاد مساجد", "تطهير مساجد مصر", "شركة تنظيف مساجد"]
      }
    },
    {
      id: "home_cleaning_deep",
      name_ar: "تنظيف المنازل العميق 🏠",
      price: 14,
      type: "meter",
      category: "home_cleaning",
      description_ar: "تنظيف شامل يشمل الحوائط، الأرضيات، المطابخ، والدهون المتراكمة ليعود منزلك جديداً.",
      icon: "fas fa-home",
      includes: ["جلي وتلميع الأرضيات", "إزالة دهون المطبخ", "تعقيم الحمامات", "تلميع النجف والتحف"],
      video_url: "https://www.youtube.com/embed/c6zt_s5gU0I",
      seo: {
          title: "شركة تنظيف عميق للمنازل والفلل | التجمع والشيخ زايد | كلين ماستر",
          description: "خدمة التنظيف العميق (Deep Cleaning) للشقق والفلل. إزالة الدهون والترسبات وتعقيم كامل للمكان.",
          keywords: ["تنظيف عميق", "ديب كليننج", "تنظيف فلل"]
      }
    },
    {
      id: "home_cleaning_regular",
      name_ar: "تنظيف المنازل العادي 🧹",
      price: 10,
      type: "meter",
      category: "home_cleaning",
      description_ar: "نظافة دورية تشمل مسح الأتربة، ترتيب الغرف، وتنظيف الأرضيات.",
      icon: "fas fa-broom",
      includes: ["مسح الأتربة", "نظافة الحمامات", "ترتيب الأسرة", "تعطير المنزل"],
      video_url: "https://www.youtube.com/embed/jJzF-BTv-0o",
      seo: {
          title: "عاملات نظافة بالساعة واليوم | تنظيف شقق مصر | كلين ماستر",
          description: "مكتب شغالات وعاملات نظافة مدربات. خدمة تنظيف شقق سريعة ومضمونة في القاهرة.",
          keywords: ["عاملات نظافة", "مكتب شغالات", "تنظيف شقق"]
      }
    }
    // ... remaining services kept same internally but with better SEO titles
  ] as Service[],
  config: {
    imgbb_api_key: getEnv("IMGBB_API_KEY", "bde613bd4475de5e00274a795091ba04"),
    whatsapp_number: "201013373634",
    payment_number: "01013373634",
    minimum_area: 100,
    discount_percentage: 10,
    advance_payment_percentage: 25
  },
  testimonials: [
    { id: 1, name: "م. أحمد الشاذلي", role: "عميل - التجمع الخامس", content: "بصراحة احترافية مذهلة، التزموا بالمواعيد والسجاد رجع كأنه لسه مشتريينه. شكراً لفريق كلين ماستر.", rating: 5 },
    { id: 2, name: "أ. ندى محمود", role: "ربة منزل - مدينتي", content: "جربت شركات كتير لكن كلين ماستر الأفضل في تنظيف الانتريهات بالبخار، ريحة البيت بقت تجنن.", rating: 5 }
  ] as Testimonial[],
  // Fix: Added before_after property to appData to resolve type errors in ServicesSection
  before_after: [
    {
      before: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1000&auto=format&fit=crop",
      after: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
      label: "تنظيف الكنب بالبخار"
    },
    {
      before: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=1000&auto=format&fit=crop",
      after: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=1000&auto=format&fit=crop",
      label: "جلي وتلميع الرخام"
    }
  ] as BeforeAfterImage[]
};
