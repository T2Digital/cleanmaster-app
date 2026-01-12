
import React from 'react';
import { appData } from '../../constants';

const TestimonialCard: React.FC<{ testimonial: typeof appData.testimonials[0] }> = ({ testimonial }) => (
    <div className="bg-[#FCFCF9] p-6 rounded-lg shadow-sm border border-[#5E5240]/[0.12] flex flex-col h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center gap-1 mb-3 text-yellow-400 text-sm">
            {[...Array(5)].map((_, i) => (
                <i key={i} className={`fas fa-star ${i < testimonial.rating ? '' : 'text-gray-300'}`}></i>
            ))}
        </div>
        <p className="text-[#626C71] italic mb-6 flex-grow leading-relaxed relative">
            <span className="text-4xl text-[#21808D]/20 absolute -top-4 -right-2 font-serif">"</span>
            {testimonial.content}
            <span className="text-4xl text-[#21808D]/20 absolute -bottom-8 -left-2 font-serif">"</span>
        </p>
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[#5E5240]/[0.08]">
            <div className="w-10 h-10 rounded-full bg-[#21808D] text-white flex items-center justify-center font-bold text-lg">
                {testimonial.name.charAt(0)}
            </div>
            <div>
                <h4 className="font-bold text-[#13343B] text-sm">{testimonial.name}</h4>
                <span className="text-xs text-[#626C71]">{testimonial.role}</span>
            </div>
        </div>
    </div>
);

const TestimonialsSection: React.FC = () => {
    return (
        <section className="py-20 bg-gradient-to-b from-white to-blue-500/[0.04]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4 text-[#13343B]">ماذا يقول عملاؤنا؟</h2>
                    <p className="text-lg text-[#626C71] max-w-2xl mx-auto">نسعد دائماً بخدمتكم ورأيكم يهمنا</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {appData.testimonials.map(item => (
                        <TestimonialCard key={item.id} testimonial={item} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
