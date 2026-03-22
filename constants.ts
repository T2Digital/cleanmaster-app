import { Service, Testimonial, BeforeAfterImage } from './types';

// Helper to get environment variables safely
const getEnv = (key: string, defaultValue: string): string => {
  let value: any = undefined;
  try {
    // Check import.meta.env (Vite standard)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      value = import.meta.env[`VITE_${key}`] || import.meta.env[key];
    }
    
    // Check process.env (Node/Vercel fallback)
    // @ts-ignore
    if (!value && typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      value = process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
    }
  } catch (e) {
    // Silence errors during build time
  }

  // Force fallback if value is not a valid non-empty string
  if (typeof value !== 'string' || value.trim().length === 0) {
    return defaultValue;
  }
  
  return value.trim();
};

export const appData = {
  company_info: {
    name_ar: "كلين ماستر",
    name_en: "Clean Master",
    description_ar: "رائد خدمات التنظيف في مصر - نقدم خدمات تنظيف احترافية للمنازل والشركات بأعلى معايير الجودة",
    phone: "01013373634",
    whatsapp: "201013373634",
    payment_number: "01013373634",
    email: "info@cleanmaster.com.eg",
    locations: ["القاهرة الجديدة (التجمع)", "الشيخ زايد & 6 أكتوبر", "الزمالك & المهندسين", "المعادي", "مدينتي & الرحاب"],
    working_hours: "من 8 صباحاً حتى 10 مساءً - 7 أيام في الأسبوع"
  },
  services: [
    {
      id: "mosque_carpets",
      name_ar: "غسيل سجاد المساجد 🕌",
      price: 7,
      type: "meter",
      category: "carpets_curtains",
      description_ar: "خدمة غسيل وتنظيف سجاد المساجد بتقنيات متطورة وآمنة",
      icon: "fas fa-mosque",
      includes: ["غسيل عميق بالبخار", "تعقيم وتطهير", "إزالة البقع الصعبة", "تجفيف سريع"],
      video_url: "https://www.youtube.com/embed/P2-IZj-s3PI",
      seo: {
          title: "غسيل سجاد مساجد في مصر | تعقيم وتطهير | كلين ماستر",
          description: "أفضل خدمة غسيل سجاد مساجد في مصر. تنظيف بالبخار، إزالة الروائح، تعقيم شامل للموكيت والسجاد بأسعار خاصة للمساجد والجمعيات الخيرية.",
          keywords: ["غسيل سجاد مساجد", "تنظيف موكيت مساجد", "شركة تنظيف مساجد", "تطهير مساجد", "غسيل سجاد بالبخار", "ارخص شركة تنظيف مساجد"]
      }
    },
    {
      id: "home_cleaning_deep",
      name_ar: "تنظيف المنازل العميق 🏠",
      price: 14,
      type: "meter",
      category: "home_cleaning",
      description_ar: "تنظيف معمق وشامل لجميع أجزاء المنزل",
      icon: "fas fa-home",
      includes: ["تنظيف عميق لجميع الأسطح", "تنظيف داخل الأجهزة", "تنظيف النوافذ", "تلميع الأثاث"],
      video_url: "https://www.youtube.com/embed/c6zt_s5gU0I",
      seo: {
          title: "تنظيف عميق للمنازل والفلل | إزالة الدهون والترسبات | كلين ماستر",
          description: "خدمة التنظيف العميق (Deep Cleaning) تشمل المطابخ، الحمامات، والزوايا الصعبة. تعقيم شامل ضد الفيروسات. احجز الآن لبيت صحي.",
          keywords: ["تنظيف عميق", "ديب كليننج", "تنظيف فلل", "تنظيف قصور", "جلي بلاط", "تنظيف سيراميك", "شركة تنظيف مطابخ"]
      }
    },
    {
      id: "home_cleaning_regular",
      name_ar: "تنظيف المنازل العادي 🧹",
      price: 10,
      type: "meter",
      category: "home_cleaning",
      description_ar: "تنظيف شامل للمنازل يشمل جميع الغرف والمرافق",
      icon: "fas fa-home",
      includes: ["تنظيف جميع الغرف", "تنظيف الحمامات", "تنظيف المطبخ", "مسح الأرضيات"],
      video_url: "https://www.youtube.com/embed/jJzF-BTv-0o",
      seo: {
          title: "شركة تنظيف منازل في القاهرة والجيزة | خدمة 24 ساعة | كلين ماستر",
          description: "شركة تنظيف منازل مجربة ومضمونة. نوفر عاملات نظافة مدربات لتنظيف الشقق والفلل. خدمة سريعة في التجمع، الشيخ زايد، والمعادي.",
          keywords: ["شركة تنظيف منازل", "تنظيف شقق", "مكتب شغالات", "عاملات نظافة بالساعة", "شركة تنظيف بالتجمع الخامس", "شركة تنظيف بالشيخ زايد", "اسعار شركات التنظيف"]
      }
    },
    {
      id: "post_construction",
      name_ar: "تنظيف بعد التشطيب 🏗️",
      price: 13,
      type: "meter",
      category: "home_cleaning",
      description_ar: "تنظيف متخصص بعد أعمال التشطيب والبناء",
      icon: "fas fa-hard-hat",
      includes: ["إزالة أتربة البناء", "تنظيف بقايا الدهان", "تلميع الأرضيات", "تنظيف النوافذ"],
      video_url: "https://www.youtube.com/embed/y2l2F2DTs0k",
      seo: {
          title: "شركة تنظيف بعد التشطيب | إزالة بقايا الدهان والاسمنت | كلين ماستر",
          description: "متخصصون في تنظيف الشقق والفلل بعد التشطيب. إزالة البوية، الاسمنت، الغراء، وتنظيف الزجاج. تسليم الشقة على المفتاح.",
          keywords: ["تنظيف بعد التشطيب", "شركة تنظيف شقق جديدة", "ازالة بقع الدهان", "تلميع بورسلين", "نظافة ما بعد البناء", "شركات تنظيف في مدينتي"]
      }
    },
    {
      id: "closed_places",
      name_ar: "تنظيف الاماكن المغلقة 🚪",
      price: 20,
      type: "meter",
      category: "home_cleaning",
      description_ar: "تنظيف الأماكن المغلقة لفترة طويلة",
      icon: "fas fa-door-closed",
      includes: ["إزالة الغبار المتراكم", "تعقيم شامل", "إزالة الروائح", "تهوية المكان"],
      video_url: "https://www.youtube.com/embed/sL9s9x7pW-I",
      seo: {
          title: "تنظيف الشقق المغلقة والمهملة | تعقيم شامل | كلين ماستر",
          description: "حلول تنظيف خاصة للشقق المغلقة لسفر أو هجر. مكافحة حشرات، إزالة أتربة متراكمة، وتطهير كامل للمكان ليعود جديداً.",
          keywords: ["تنظيف شقة مغلقة", "تنظيف بيوت مهجورة", "تعقيم منازل", "شركة تنظيف بالرحاب", "تنظيف شامل"]
      }
    },
    {
      id: "empty_apartment",
      name_ar: "تنظيف شقة فاضية 🏢",
      price: 12,
      type: "meter",
      category: "home_cleaning",
      description_ar: "تنظيف الشقق الفارغة قبل الانتقال",
      icon: "fas fa-building",
      includes: ["تنظيف شامل للشقة", "تنظيف الخزائن", "تلميع الأرضيات", "تنظيف التكييف"],
      video_url: "https://www.youtube.com/embed/kH8WbY80y-I",
      seo: {
          title: "تجهيز الشقق قبل النقل | تنظيف شقق فارغة | كلين ماستر",
          description: "استلم شقتك نظيفة تماماً قبل العفش. غسيل حوائط، تنظيف ارضيات، وتطهير حمامات ومطابخ. خدمة سريعة في نفس اليوم.",
          keywords: ["تنظيف شقة قبل السكن", "شركة تنظيف قبل النقل", "تجهيز عرايس", "تنظيف شقق ايجار جديد"]
      }
    },
    {
      id: "painting_finishing",
      name_ar: "دهانات وتشطيب 🎨",
      price: 0,
      type: "consultation",
      category: "finishing",
      description_ar: "خدمات الدهان والتشطيب (السعر بعد المعاينة)",
      icon: "fas fa-paint-roller",
      includes: ["معاينة مجانية", "استشارة فنية", "أفضل المواد", "ضمان على العمل"],
      video_url: "https://www.youtube.com/embed/m7w0-v7aJcI",
      seo: {
          title: "مقاول دهانات وتشطيبات وديكور | نقاشة حديثة | كلين ماستر",
          description: "أفضل صنايعية نقاشة ودهانات في مصر. تشطيبات شقق، ديكورات حديثة، معالجة رطوبة. أسعار مناسبة وتنفيذ في الموعد.",
          keywords: ["نقاش شاطر", "تشطيب شقق", "دهانات جوتن", "ديكورات حوائط", "مقاول تشطيبات", "صنايعي دهانات"]
      }
    },
    {
      id: "home_carpet",
      name_ar: "تنظيف موكيت المنازل 🛋️",
      price: 10,
      type: "meter",
      category: "carpets_curtains",
      description_ar: "تنظيف وغسيل موكيت المنازل بالبخار",
      icon: "fas fa-rug",
      includes: ["غسيل بالبخار", "إزالة البقع", "تجفيف سريع", "معطرات طبيعية"],
      video_url: "https://www.youtube.com/embed/QAU2e8G-0F4",
      seo: {
          title: "غسيل موكيت في المنزل | تنظيف بالبخار | كلين ماستر",
          description: "غسيل موكيت وسجاد في نفس المكان دون نقل. ماكينات تنظيف بالبخار لإزالة أصعب البقع والروائح الكريهة.",
          keywords: ["غسيل موكيت", "شركة تنظيف سجاد", "دراي كلين سجاد", "تنظيف موكيت بالبخار", "ازالة بقع الموكيت"]
      }
    },
    {
      id: "office_carpet",
      name_ar: "تنظيف موكيت المكاتب 💼",
      price: 15,
      type: "meter",
      category: "carpets_curtains",
      description_ar: "تنظيف موكيت المكاتب والشركات بتقنيات متطورة",
      icon: "fas fa-building",
      includes: ["تنظيف احترافي", "مواد آمنة", "عمل سريع", "جدولة مرنة"],
      video_url: "https://www.youtube.com/embed/J7VzZN4aY9g",
      seo: {
          title: "عقود تنظيف شركات ومكاتب | غسيل موكيت إداري | كلين ماستر",
          description: "خدمات تنظيف للشركات والمكاتب الإدارية. غسيل موكيت، تنظيف كراسي مكتب، عقود صيانة دورية بأفضل الأسعار.",
          keywords: ["تنظيف شركات", "نظافة مكاتب", "غسيل موكيت شركات", "عقود نظافة", "شركة خدمات بيئية"]
      }
    },
    {
      id: "antique_sofa",
      name_ar: "تنظيف الانتريه 🛋️",
      price: 350,
      type: "fixed",
      category: "furniture",
      description_ar: "تنظيف وغسيل طقم الانتريه",
      icon: "fas fa-couch",
      includes: ["غسيل بالبخار", "تنظيف القماش", "إزالة البقع", "تعطير"],
      video_url: "https://www.youtube.com/embed/y-a9yI-iR0s",
      seo: {
          title: "غسيل انتريهات وصالونات بالبخار في البيت | كلين ماستر",
          description: "رجع انتريهك جديد مع خدمة التنظيف بالبخار. إزالة بقع الحبر والشوكولاتة والزيوت. تنظيف الكنب والمجالس بأحدث الاجهزة.",
          keywords: ["غسيل انتريهات", "تنظيف كنب بالبخار", "تنظيف صالونات", "ازالة بقع الانتريه", "شركة تنظيف مفروشات"]
      }
    },
    {
      id: "salon_sofa",
      name_ar: "تنظيف الصالون 🪑",
      price: 350,
      type: "fixed",
      category: "furniture",
      description_ar: "تنظيف وغسيل طقم الصالون",
      icon: "fas fa-couch",
      includes: ["تنظيف شامل", "غسيل القماش", "تلميع الخشب", "تعطير"],
      video_url: "https://www.youtube.com/embed/S_B7WCEsS-s",
      seo: {
          title: "تنظيف صالونات مدهب وكلاسيك | عناية فائقة | كلين ماستر",
          description: "متخصصون في تنظيف الصالونات المدهبة والكلاسيكية. مواد خاصة للحفاظ على القماش والخشب. خدمة منزلية مميزة.",
          keywords: ["تنظيف صالون مدهب", "تلميع خشب الصالون", "غسيل قماش الصالون", "شركة تنظيف اثاث"]
      }
    },
    {
      id: "small_corner",
      name_ar: "تنظيف ركنه صغيرة 🛋️",
      price: 350,
      type: "fixed",
      category: "furniture",
      description_ar: "تنظيف الركنة الصغيرة",
      icon: "fas fa-chair",
      includes: ["غسيل القماش", "تنظيف الإسفنج", "إزالة البقع", "تعطير"],
      video_url: "https://www.youtube.com/embed/lCPr_3-yeI4",
      seo: {
          title: "غسيل ركنه L Shape | تنظيف كنب مودرن | كلين ماستر",
          description: "تنظيف الركنة والكنب المودرن في منزلك. تقنية الشفط والتجفيف الفوري. أسعار تناسب الجميع.",
          keywords: ["غسيل ركنه", "تنظيف كنب امريكي", "تنظيف مفروشات", "سعر غسيل الركنه"]
      }
    },
    {
      id: "large_corner",
      name_ar: "تنظيف ركنه كبيرة 🛋️",
      price: 85,
      type: "meter",
      category: "furniture",
      description_ar: "تنظيف الركنة الكبيرة حسب المساحة",
      icon: "fas fa-chair",
      includes: ["تنظيف حسب الحجم", "غسيل شامل", "تجفيف سريع", "حماية القماش"],
      video_url: "https://www.youtube.com/embed/lCPr_3-yeI4",
      seo: {
          title: "تنظيف مجالس عربية وركنات كبيرة | خصم 10% | كلين ماستر",
          description: "خدمة تنظيف المجالس العربية والركنات الكبيرة بالمنزل. تعطير وتطهير شامل.",
          keywords: ["غسيل مجالس", "تنظيف ديوانيات", "تنظيف كنب كبير", "شركة تنظيف اثاث منزلي"]
      }
    },
    {
      id: "lazy_boy",
      name_ar: "كرسي ليزى بوى 💺",
      price: 150,
      type: "fixed",
      category: "furniture",
      description_ar: "تنظيف كرسي ليزى بوى",
      icon: "fas fa-chair",
      includes: ["تنظيف القماش", "تنظيف الآلية", "تلميع الجلد", "تعطير"],
      video_url: "https://www.youtube.com/embed/bXmQyY2eWJ4",
      seo: {
          title: "تنظيف كراسي ليزي بوي وريكلاينر | عناية خاصة | كلين ماستر",
          description: "تنظيف متخصص لكراسي الراحة (Lazy Boy). تنظيف الجلد والقماش والمخمل بدقة عالية.",
          keywords: ["تنظيف ليزي بوي", "غسيل كراسي جلد", "تلميع كراسي مكتب", "صيانة مفروشات"]
      }
    },
    {
      id: "large_mattress",
      name_ar: "تنظيف مرتبة كبيرة 🛏️",
      price: 350,
      type: "fixed",
      category: "furniture",
      description_ar: "تنظيف وتعقيم المرتبة الكبيرة",
      icon: "fas fa-bed",
      includes: ["تنظيف عميق", "تعقيم وتطهير", "إزالة الروائح", "تجفيف سريع"],
      video_url: "https://www.youtube.com/embed/u_Fz7d-a16I",
      seo: {
          title: "غسيل مراتب السرير وإزالة البقع والروائح | كلين ماستر",
          description: "تخلص من بقع المراتب، العثة، وحشرات الفراش. خدمة غسيل وتعقيم المراتب بالبخار في المنزل.",
          keywords: ["غسيل مراتب", "تنظيف مراتب تاكي", "ازالة بقع البول من المراتب", "تعقيم مراتب", "مكافحة حشرات الفراش"]
      }
    },
    {
      id: "small_mattress",
      name_ar: "تنظيف مرتبة صغيرة 🛏️",
      price: 250,
      type: "fixed",
      category: "furniture",
      description_ar: "تنظيف وتعقيم المرتبة الصغيرة",
      icon: "fas fa-bed",
      includes: ["تنظيف شامل", "تعقيم", "إزالة البقع", "تعطير"],
      video_url: "https://www.youtube.com/embed/u_Fz7d-a16I",
      seo: {
          title: "تنظيف مراتب اطفال وتعقيمها | كلين ماستر",
          description: "حماية لصحة أطفالك. تنظيف وتعقيم مراتب الأطفال بمواد آمنة وطبيعية 100%.",
          keywords: ["تنظيف مراتب اطفال", "تعقيم غرف نوم", "غسيل مفروشات"]
      }
    },
    {
      id: "dining_chair",
      name_ar: "تنظيف كرسي سفرة 🪑",
      price: 50,
      type: "fixed",
      category: "furniture",
      description_ar: "تنظيف كرسي السفرة",
      icon: "fas fa-chair",
      includes: ["تنظيف القماش", "تلميع الخشب", "إزالة البقع", "تعطير"],
      video_url: "https://www.youtube.com/embed/V-bS0s5-y6s",
      seo: {
          title: "غسيل كراسي السفرة وتلميع الخشب | كلين ماستر",
          description: "رجع كراسي السفرة جديدة. إزالة بقع الطعام والدهون من قماش الكراسي وتلميع الخشب.",
          keywords: ["غسيل كراسي سفرة", "تنجيد كراسي", "تنظيف قماش الكراسي", "ازالة بقع الزيت"]
      }
    },
    {
      id: "large_curtain",
      name_ar: "تنظيف ستارة كبيرة 🖼️",
      price: 200,
      type: "fixed",
      category: "carpets_curtains",
      description_ar: "تنظيف وغسيل الستارة الكبيرة",
      icon: "fas fa-home",
      includes: ["غسيل دقيق", "كي احترافي", "إزالة البقع", "حماية القماش"],
      video_url: "https://www.youtube.com/embed/yCj2f_MLt8M",
      seo: {
          title: "غسيل ستائر بالبخار وهي معلقة | كي وتعطير | كلين ماستر",
          description: "مش محتاج تفك الستائر. بنغسل الستائر والبراقع بالبخار وهي في مكانها. خدمة سريعة ونظافة مثالية.",
          keywords: ["غسيل ستائر", "تنظيف ستائر بالبخار", "تنظيف براقع", "دراي كلين ستائر", "مكوجي ستائر"]
      }
    },
    {
      id: "small_curtain",
      name_ar: "تنظيف ستارة صغيرة 🖼️",
      price: 150,
      type: "fixed",
      category: "carpets_curtains",
      description_ar: "تنظيف وغسيل الستارة الصغيرة",
      icon: "fas fa-home",
      includes: ["غسيل احترافي", "كي مثالي", "إزالة الأتربة", "تعطير"],
      video_url: "https://www.youtube.com/embed/yCj2f_MLt8M",
      seo: {
          title: "تنظيف ستائر مودرن ورول | كلين ماستر",
          description: "تنظيف جميع انواع الستائر (مودرن، رول، بلاك اوت) بأحدث الأجهزة.",
          keywords: ["غسيل ستائر رول", "تنظيف بلاك اوت", "شركة تنظيف ستائر"]
      }
    },
    {
      id: "large_rug",
      name_ar: "سجادة كبيرة 🧶",
      price: 150,
      type: "fixed",
      category: "carpets_curtains",
      description_ar: "تنظيف وغسيل السجادة الكبيرة",
      icon: "fas fa-rug",
      includes: ["غسيل بالبخار", "إزالة البقع العنيدة", "تجفيف سريع", "معطرات طبيعية"],
      video_url: "https://www.youtube.com/embed/rVZyAAM4i4A",
      seo: {
          title: "مغسلة سجاد دليفري | غسيل سجاد فوري | كلين ماستر",
          description: "أفضل خدمة غسيل سجاد في مصر. استلام وتسليم أو غسيل في المنزل. نحافظ على ألوان السجاد.",
          keywords: ["مغسلة سجاد", "غسيل سجاد يدوي", "غسيل سجاد الي", "دراي كلين سجاد"]
      }
    },
    {
      id: "small_rug",
      name_ar: "سجادة صغيرة 🧶",
      price: 99,
      type: "fixed",
      category: "carpets_curtains",
      description_ar: "تنظيف وغسيل السجادة الصغيرة",
      icon: "fas fa-rug",
      includes: ["تنظيف شامل", "إزالة الأوساخ", "تجفيف سريع", "تعطير"],
      video_url: "https://www.youtube.com/embed/rVZyAAM4i4A",
      seo: {
          title: "غسيل مشايات وسجاد صغير | كلين ماستر",
          description: "خدمة غسيل سجاد ومشايات بأسعار اقتصادية. جودة عالية وسرعة في التنفيذ.",
          keywords: ["غسيل مشايات", "تنظيف دواسات", "غسيل سجاد الحرير", "غسيل سجاد الشاج"]
      }
    }
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
    {
      id: 1,
      name: "أحمد محمد",
      role: "عميل منزلي",
      content: "خدمة ممتازة جداً، فريق العمل محترم وملتزم بالمواعيد. السجاد رجع كأنه جديد تماماً.",
      rating: 5
    },
    {
      id: 2,
      name: "سارة محمود",
      role: "ربة منزل",
      content: "جربت خدمة تنظيف الانتريه والصالون، النتيجة مبهرة وإزالة البقع كانت ممتازة. شكراً كلين ماستر.",
      rating: 5
    },
    {
      id: 3,
      name: "م. كريم عادل",
      role: "صاحب شركة",
      content: "تعاقدنا معاهم لتنظيف مقر الشركة، احترافية عالية وأسعار تنافسية جداً مقارنة بالجودة.",
      rating: 4
    },
    {
        id: 4,
        name: "د. منى علي",
        role: "طبيبة",
        content: "التنظيف بعد التشطيب كان هم كبير بالنسبة لي، لكن الفريق أنجز المهمة في وقت قياسي وبدقة عالية.",
        rating: 5
    }
  ] as Testimonial[],
  before_after: [
      {
          before: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=2668&auto=format&fit=crop",
          after: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2668&auto=format&fit=crop",
          label: "تنظيف وتلميع مطابخ"
      },
      {
          before: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=80&w=600",
          after: "https://images.unsplash.com/photo-1527513066761-e95c48866579?auto=format&fit=crop&q=80&w=600",
          label: "تنظيف غرفة معيشة"
      }
  ] as BeforeAfterImage[]
};