
import React from 'react';
import { appData } from '../../constants';

const ContactSection: React.FC = () => {
    const { company_info } = appData;

    const contactItems = [
        { icon: "fas fa-phone", title: "اتصل بنا", value: company_info.phone },
        { icon: "fab fa-whatsapp", title: "واتساب", value: company_info.whatsapp },
        { icon: "fas fa-envelope", title: "البريد الإلكتروني", value: company_info.email },
        { icon: "fas fa-clock", title: "ساعات العمل", value: company_info.working_hours },
    ];

    return (
        <section id="contact" className="bg-red-500/[0.08] py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4 text-[#13343B]">تواصل معنا</h2>
                    <p className="text-lg text-[#626C71] max-w-2xl mx-auto">نحن هنا لخدمتك في أي وقت</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {contactItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 bg-[#FCFCF9] p-6 rounded-lg shadow-sm border border-[#5E5240]/[0.12]">
                            <div className="w-12 h-12 flex-shrink-0 bg-[#21808D] text-white rounded-lg flex items-center justify-center text-xl">
                                <i className={item.icon}></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[#13343B] mb-1">{item.title}</h3>
                                <p className="text-[#626C71] m-0">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
