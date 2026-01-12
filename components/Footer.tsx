import React from 'react';
import { appData } from '../constants';

const Footer: React.FC = () => {
    const { company_info } = appData;

    return (
        <footer className="bg-[#FCFCF9] border-t border-[#5E5240]/[0.2] pt-10 pb-5">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-center md:text-right">
                    <div className="flex flex-col items-center md:items-start">
                         <div className="flex items-center gap-2 no-underline mb-4">
                            <img 
                                src="https://i.ibb.co/f52dPHc/1000049048.jpg" 
                                alt="Clean Master Logo" 
                                className="h-16 w-auto object-contain rounded-xl shadow-sm"
                            />
                            <span className="text-xl font-bold text-[#21808D]">{company_info.name_ar}</span>
                        </div>
                        <p className="text-[#626C71]">{company_info.description_ar}</p>
                        <div className="flex gap-3 mt-4">
                            <a href="#" target="_blank" className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/[0.08] text-[#21808D] transition-all duration-200 hover:bg-[#21808D] hover:text-white transform hover:-translate-y-0.5"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" target="_blank" className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/[0.08] text-[#21808D] transition-all duration-200 hover:bg-[#21808D] hover:text-white transform hover:-translate-y-0.5"><i className="fab fa-twitter"></i></a>
                            <a href="#" target="_blank" className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/[0.08] text-[#21808D] transition-all duration-200 hover:bg-[#21808D] hover:text-white transform hover:-translate-y-0.5"><i className="fab fa-instagram"></i></a>
                            <a href={`https://wa.me/${company_info.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/[0.08] text-[#21808D] transition-all duration-200 hover:bg-[#21808D] hover:text-white transform hover:-translate-y-0.5"><i className="fab fa-whatsapp"></i></a>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-[#13343B]">خدماتنا</h4>
                        <ul className="list-none p-0 m-0 space-y-2">
                            {appData.services.slice(0, 4).map(service => (
                                <li key={service.id}><a href="/#services" className="text-[#626C71] no-underline transition-colors hover:text-[#21808D]">{service.name_ar}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-[#13343B]">مناطق الخدمة</h4>
                        <ul className="list-none p-0 m-0 space-y-2">
                            {company_info.locations.map(location => (
                                <li key={location} className="text-[#626C71]">{location}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-[#13343B]">تواصل معنا</h4>
                        <ul className="list-none p-0 m-0 space-y-2">
                            <li className="flex items-center justify-center md:justify-start gap-2 text-[#626C71]">
                                <i className="fas fa-phone text-[#21808D]"></i> {company_info.phone}
                            </li>
                            <li className="flex items-center justify-center md:justify-start gap-2 text-[#626C71]">
                                <i className="fas fa-envelope text-[#21808D]"></i> {company_info.email}
                            </li>
                             <li className="flex items-center justify-center md:justify-start gap-2 text-[#626C71]">
                                <i className="fab fa-whatsapp text-[#21808D]"></i> واتساب
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-[#5E5240]/[0.2] pt-5 text-center text-[#626C71]">
                    <p>&copy; {new Date().getFullYear()} {company_info.name_ar}. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;