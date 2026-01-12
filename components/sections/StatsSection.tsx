
import React from 'react';

const StatsSection: React.FC = () => {
    return (
        <section className="py-12 bg-white border-y border-[#5E5240]/[0.1]">
            <div className="container mx-auto px-4">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="text-center group p-6 rounded-xl transition-all duration-300 hover:bg-blue-50">
                        <div className="text-5xl font-bold text-[#21808D] mb-2 group-hover:scale-110 transition-transform duration-300">+5000</div>
                        <p className="text-[#626C71] font-medium text-lg">عميل راضي</p>
                    </div>
                    <div className="text-center group p-6 rounded-xl transition-all duration-300 hover:bg-blue-50">
                        <div className="text-5xl font-bold text-[#21808D] mb-2 group-hover:scale-110 transition-transform duration-300">+10</div>
                        <p className="text-[#626C71] font-medium text-lg">سنوات خبرة</p>
                    </div>
                    <div className="text-center group p-6 rounded-xl transition-all duration-300 hover:bg-blue-50">
                        <div className="text-5xl font-bold text-[#21808D] mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
                        <p className="text-[#626C71] font-medium text-lg">خدمة عملاء</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
