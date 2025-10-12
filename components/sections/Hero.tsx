
import React, { useContext } from 'react';
import { AppContext } from '../../App';

const Hero: React.FC = () => {
    const appContext = useContext(AppContext);

    const scrollToServices = () => {
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
             const headerOffset = 80;
             const elementPosition = servicesSection.getBoundingClientRect().top + window.pageYOffset;
             const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };
    
    return (
        <section id="home" className="bg-gradient-to-br from-blue-500/[0.08] to-cyan-500/[0.08] pt-32 pb-20 mt-[70px]">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="text-center lg:text-right">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#13343B] leading-tight">رائد خدمات التنظيف في مصر</h1>
                        <p className="text-xl text-[#626C71] mb-6">نقدم خدمات تنظيف احترافية للمنازل والشركات بأعلى معايير الجودة</p>
                        <div className="flex justify-center lg:justify-start gap-6 mb-8">
                            <div className="flex items-center gap-2 text-[#21808D] font-medium">
                                <i className="fas fa-shield-alt text-xl"></i>
                                <span>ضمان الجودة</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#21808D] font-medium">
                                <i className="fas fa-clock text-xl"></i>
                                <span>خدمة سريعة</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#21808D] font-medium">
                                <i className="fas fa-star text-xl"></i>
                                <span>فريق محترف</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                            <button
                                onClick={() => appContext?.openBookingModal(null)}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-[#21808D] text-white transition-colors hover:bg-[#1D7480] text-lg"
                            >
                                <i className="fas fa-rocket"></i>
                                احجز خدمتك الآن
                            </button>
                             <a href={`https://wa.me/201013373634`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold border border-[#5E5240]/[0.2] text-[#13343B] transition-colors hover:bg-[#5E5240]/[0.12] text-lg">
                                <i className="fab fa-whatsapp"></i>
                                واتساب
                            </a>
                        </div>
                    </div>
                    <div className="flex justify-center items-center">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FCFCF9] p-6 rounded-lg shadow-md w-full">
                            <div className="text-center">
                                <h3 className="text-3xl font-bold text-[#21808D] mb-2">+5000</h3>
                                <p className="text-[#626C71] text-sm">عميل راضي</p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-3xl font-bold text-[#21808D] mb-2">+10</h3>
                                <p className="text-[#626C71] text-sm">سنوات خبرة</p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-3xl font-bold text-[#21808D] mb-2">24/7</h3>
                                <p className="text-[#626C71] text-sm">خدمة عملاء</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
