
import React, { useContext } from 'react';
import { Service } from '../types';
import { AppContext } from '../App';

interface ServiceModalContentProps {
    service: Service;
}

const ServiceModalContent: React.FC<ServiceModalContentProps> = ({ service }) => {
    const appContext = useContext(AppContext);

    const priceDisplay = service.type === 'consultation' ? 'السعر بعد المعاينة' :
        service.type === 'meter' ? `${service.price} جنيه لكل متر مربع` :
        `${service.price} جنيه`;

    const duration = service.type === 'meter' ? 'حسب المساحة' : '2-4 ساعات';

    return (
        <div>
            {service.video_url ? (
                <div className="w-full h-48 md:h-64 rounded-lg mb-6 bg-black overflow-hidden">
                    <iframe
                        className="w-full h-full"
                        src={service.video_url}
                        title={service.name_ar}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            ) : (
                <div className="w-full h-48 md:h-64 rounded-lg mb-6 bg-blue-500/[0.08] flex items-center justify-center text-[#21808D] text-5xl">
                    <i className="fas fa-play-circle"></i>
                </div>
            )}
            <div className="text-right mb-6">
                <h3 className="text-2xl font-bold mb-4 text-[#13343B]">{service.name_ar}</h3>
                <p className="text-[#626C71] leading-relaxed">{service.description_ar}</p>

                <div className="bg-green-500/[0.08] p-4 rounded-lg my-4">
                    <h4 className="text-[#22C55E] mb-3 flex items-center gap-2 font-semibold">
                        <i className="fas fa-check-circle"></i> ما تشمله الخدمة:
                    </h4>
                    <ul className="list-none p-0 m-0 space-y-1">
                        {service.includes.map((item, index) => (
                            <li key={index} className="text-[#626C71] flex items-center gap-2">
                                <span className="text-[#22C55E] font-bold text-lg">✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-blue-500/[0.08] p-4 rounded-lg">
                    <div className="flex justify-between items-center py-2 border-b border-[#5E5240]/[0.12]">
                        <span className="font-semibold">السعر:</span>
                        <span className="font-semibold">{priceDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#5E5240]/[0.12]">
                        <span>المدة المتوقعة:</span>
                        <span>{duration}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span>خصم عند الدفع الإلكتروني:</span>
                        <span className="text-[#21808D] font-bold">10%</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => appContext?.openBookingModal(service)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-[#21808D] text-white transition-colors hover:bg-[#1D7480] text-lg"
            >
                <i className="fas fa-calendar-check"></i>
                احجز الخدمة الآن
            </button>
        </div>
    );
};

export default ServiceModalContent;