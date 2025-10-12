
import React from 'react';

const features = [
    { icon: "fas fa-users", title: "فريق عمل مدرب ومحترف", description: "فريق متخصص ومدرب على أحدث تقنيات التنظيف" },
    { icon: "fas fa-tools", title: "معدات حديثة ومواد آمنة", description: "نستخدم أحدث المعدات ومواد تنظيف آمنة وصديقة للبيئة" },
    { icon: "fas fa-certificate", title: "ضمان جودة الخدمة", description: "نضمن لك جودة الخدمة ورضاك التام أو استرداد المبلغ" },
    { icon: "fas fa-headset", title: "خدمة عملاء 24/7", description: "فريق خدمة العملاء متاح على مدار الساعة لخدمتك" },
    { icon: "fas fa-dollar-sign", title: "أسعار تنافسية", description: "أفضل الأسعار في السوق مع جودة عالية" },
    { icon: "fas fa-bolt", title: "خدمة سريعة ومضمونة", description: "نلتزم بالمواعيد المحددة وننجز العمل في الوقت المناسب" },
];

const FeatureCard: React.FC<{ icon: string; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-[#FCFCF9] p-6 rounded-lg text-center shadow-sm border border-[#5E5240]/[0.12] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="w-16 h-16 bg-green-500/[0.08] rounded-full flex items-center justify-center mx-auto mb-4 text-[#22C55E] text-2xl">
            <i className={icon}></i>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-[#13343B]">{title}</h3>
        <p className="text-[#626C71] leading-relaxed">{description}</p>
    </div>
);

const WhyUsSection: React.FC = () => {
    return (
        <section id="about" className="bg-yellow-500/[0.08] py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4 text-[#13343B]">لماذا كلين ماستر؟</h2>
                    <p className="text-lg text-[#626C71] max-w-2xl mx-auto">نحن الخيار الأمثل لخدمات التنظيف في مصر</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyUsSection;
