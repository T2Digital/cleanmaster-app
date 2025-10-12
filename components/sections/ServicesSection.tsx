
import React from 'react';
import { appData } from '../../constants';
import { Service } from '../../types';

interface ServiceCardProps {
    service: Service;
    onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
    const priceDisplay = service.type === 'consultation' ? 'حسب المعاينة' :
        service.type === 'meter' ? `${service.price} جنيه/متر` :
        `${service.price} جنيه`;

    return (
        <div 
            onClick={onClick}
            className="bg-[#FCFCF9] rounded-lg p-6 shadow-sm border border-[#5E5240]/[0.12] transition-all duration-300 cursor-pointer relative overflow-hidden hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-[#21808D] to-[#266873]"></div>
            <div className="w-16 h-16 bg-blue-500/[0.08] rounded-lg flex items-center justify-center mb-4 text-[#21808D] text-2xl">
                <i className={service.icon || 'fas fa-sparkles'}></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#13343B]">{service.name_ar}</h3>
            <p className="text-[#626C71] mb-4 leading-relaxed">{service.description_ar}</p>
            <div className="flex items-center justify-between mt-auto">
                <span className="bg-[#21808D] text-white px-3 py-1 text-xs rounded-full font-semibold">{priceDisplay}</span>
                <span className="text-[#21808D] font-medium text-sm">اعرف المزيد ←</span>
            </div>
        </div>
    );
};


interface ServicesSectionProps {
    onServiceClick: (service: Service) => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ onServiceClick }) => {
    return (
        <section id="services" className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4 text-[#13343B]">خدماتنا المتميزة</h2>
                    <p className="text-lg text-[#626C71] max-w-2xl mx-auto">نقدم مجموعة شاملة من خدمات التنظيف بأعلى معايير الجودة</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appData.services.map(service => (
                        <ServiceCard key={service.id} service={service} onClick={() => onServiceClick(service)} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
