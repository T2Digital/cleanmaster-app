
import React, { useState, useRef, useContext } from 'react';
import { appData } from '../../constants';
import { Service, ServiceCategory } from '../../types';
import BeforeAfterSlider from '../BeforeAfterSlider';
import { AppContext } from '../../App';
import LoadingSpinner from '../LoadingSpinner';

interface ServiceCardProps {
    service: Service;
    onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
    const priceDisplay = service.type === 'consultation' ? 'حسب المعاينة' :
        service.type === 'meter' ? `${service.price} ج/م` :
        `${service.price} ج`;

    return (
        <div 
            onClick={onClick}
            className="group bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-50 transition-all duration-500 cursor-pointer relative overflow-hidden hover:-translate-y-3 hover:shadow-[0_25px_50px_rgba(33,128,141,0.2)] flex flex-col items-center text-center h-full"
        >
            {/* Hover Gradient Overlay */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#21808D] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* 3D Icon Container */}
            <div className="relative mb-6 group-hover:scale-110 transition-transform duration-500">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4DD0E1] to-[#006064] flex items-center justify-center shadow-[0_10px_20px_rgba(33,128,141,0.4)] border-4 border-white ring-1 ring-gray-100 relative overflow-hidden">
                    {/* Gloss Effect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent"></div>
                    
                    <i className={`${service.icon} text-4xl text-white drop-shadow-md relative z-10`}></i>
                </div>
                {/* Floor Shadow */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-black/20 blur-md rounded-full group-hover:w-20 group-hover:opacity-10 transition-all duration-500"></div>
            </div>
            
            <div className="relative z-10 w-full mb-4 flex-grow flex flex-col justify-center">
                <h3 className="text-xl font-black mb-3 text-[#13343B] group-hover:text-[#21808D] transition-colors leading-tight">{service.name_ar}</h3>
                <p className="text-[#626C71] text-sm leading-relaxed opacity-80">{service.description_ar}</p>
            </div>

            <div className="mt-auto w-full pt-4 border-t border-dashed border-gray-100">
                <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center bg-[#F0F9FA] text-[#006064] px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm border border-[#B2EBF2]">
                        {priceDisplay}
                    </span>
                </div>
                <button className="w-full py-3 rounded-xl bg-[#21808D] text-white font-bold text-sm shadow-md hover:bg-[#1D7480] hover:shadow-lg transition-all duration-300 transform active:scale-95">
                    حجز الآن 🚀
                </button>
            </div>
        </div>
    );
};


interface ServicesSectionProps {
    onServiceClick: (service: Service) => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ onServiceClick }) => {
    const appContext = useContext(AppContext);
    const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
    const servicesGridRef = useRef<HTMLDivElement>(null);
    const services = appContext?.services || [];

    // Forced Sort Order
    const priorityOrder = ['mosque_carpets', 'home_cleaning_deep', 'home_cleaning_regular'];
    const sortedServices = [...services].sort((a, b) => {
        const indexA = priorityOrder.indexOf(a.id);
        const indexB = priorityOrder.indexOf(b.id);
        
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
    });

    const categories: { id: ServiceCategory | 'all', name: string, icon: string }[] = [
        { id: 'all', name: 'الكل 🌀', icon: 'fas fa-th-large' },
        { id: 'home_cleaning', name: 'منازل 🏠', icon: 'fas fa-home' },
        { id: 'furniture', name: 'مفروشات 🛋️', icon: 'fas fa-couch' },
        { id: 'carpets_curtains', name: 'سجاد وستائر 🧶', icon: 'fas fa-rug' },
        { id: 'finishing', name: 'تشطيبات 🧱', icon: 'fas fa-paint-roller' },
    ];

    const handleCategoryClick = (categoryId: ServiceCategory | 'all') => {
        setActiveCategory(categoryId);
        setTimeout(() => {
            if (servicesGridRef.current) {
                const yOffset = -100;
                const element = servicesGridRef.current;
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 100);
    };

    const filteredServices = activeCategory === 'all' 
        ? sortedServices 
        : sortedServices.filter(s => s.category === activeCategory);

    return (
        <section id="services" className="py-24 bg-[#F8FAFB] relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-bl-full opacity-50 pointer-events-none blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-50/50 rounded-tr-full opacity-50 pointer-events-none blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#13343B]">خدماتنا المتميزة ✨</h2>
                    <div className="w-24 h-1.5 bg-[#21808D] mx-auto rounded-full mb-6"></div>
                    <p className="text-lg text-[#626C71] max-w-2xl mx-auto">نقدم مجموعة شاملة من خدمات التنظيف بأعلى معايير الجودة 🏆</p>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-3 mb-12 sticky top-[70px] z-30 bg-[#F8FAFB]/90 backdrop-blur-md py-4 md:static md:bg-transparent md:py-0 rounded-b-2xl md:rounded-none transition-all">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 text-sm md:text-base border ${
                                activeCategory === cat.id 
                                ? 'bg-[#21808D] text-white shadow-lg border-[#21808D] transform scale-105' 
                                : 'bg-white border-gray-200 text-[#626C71] hover:bg-white hover:shadow-md hover:text-[#21808D] hover:border-[#21808D]/30'
                            }`}
                        >
                            <i className={cat.icon}></i>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Services Grid - 2 Columns */}
                <div ref={servicesGridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-24 scroll-mt-28">
                    {filteredServices.length > 0 ? (
                        filteredServices.map(service => (
                            <ServiceCard key={service.id} service={service} onClick={() => onServiceClick(service)} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10">
                            <LoadingSpinner message="جاري تحميل الخدمات..." />
                        </div>
                    )}
                </div>
                
                {/* Before & After Section */}
                {appData.before_after && appData.before_after.length > 0 && (
                    <div className="mt-20 pt-10 border-t border-gray-200/50">
                         <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4 text-[#13343B]">لمسة سحرية ✨</h2>
                             <p className="text-[#626C71]">حرك المؤشر لترى الفرق المذهل في النظافة 🧹</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                            {appData.before_after.map((item, index) => (
                                <BeforeAfterSlider key={index} item={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ServicesSection;
