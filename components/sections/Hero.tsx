
import React, { useContext } from 'react';
import { AppContext } from '../../App';

const Hero: React.FC = () => {
    const appContext = useContext(AppContext);

    const handleScrollToServices = () => {
        const element = document.getElementById('services');
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-[70px] bg-gradient-to-br from-[#E0F7FA] via-[#FCFCF9] to-[#E6F4F1]">
            
            {/* 3D Background Elements - Cleaning Theme */}
            <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-tr from-[#21808D] to-[#4DD0E1] rounded-full blur-[80px] animate-float opacity-40"></div>
            <div className="absolute bottom-20 right-10 w-60 h-60 bg-gradient-to-bl from-[#22C55E] to-[#69F0AE] rounded-full blur-[100px] animate-float-delayed opacity-30"></div>
            
            {/* Animated Bubbles & Sparkles */}
            <div className="bubble absolute w-6 h-6 bg-white/80 rounded-full bottom-10 left-[15%] shadow-lg backdrop-blur-sm animate-bubble"></div>
            <div className="bubble absolute w-10 h-10 bg-white/60 rounded-full bottom-0 left-[35%] shadow-lg backdrop-blur-sm animate-bubble-delayed"></div>
            <div className="bubble absolute w-4 h-4 bg-white/70 rounded-full bottom-20 left-[75%] shadow-lg backdrop-blur-sm animate-bubble-slow"></div>
            
            {/* Sparkles Decoration */}
            <div className="absolute top-1/4 right-[10%] text-[#26C6DA] text-4xl opacity-60 animate-pulse delay-100">✦</div>
            <div className="absolute bottom-1/3 left-[10%] text-[#FFD700] text-3xl opacity-60 animate-pulse delay-300">✦</div>
            <div className="absolute top-1/3 left-[20%] text-[#26C6DA] text-2xl opacity-40 animate-bounce-slow">✨</div>

            <div className="container mx-auto px-4 z-10 relative">
                <div className="glass-card max-w-5xl mx-auto rounded-3xl p-8 md:p-12 text-center transform transition-all hover:scale-[1.01] duration-500 border border-white/60 shadow-[0_20px_50px_rgba(33,128,141,0.15)] overflow-hidden relative">
                    
                    {/* Background Brand Name - Watermark Style */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10vw] md:text-[8rem] font-black text-[#21808D]/5 whitespace-nowrap z-0 select-none pointer-events-none uppercase tracking-widest font-sans">
                        Clean Master
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="mb-6 animate-fadeInDown">
                             <div className="inline-block bg-[#21808D]/10 text-[#21808D] px-6 py-2 rounded-full font-bold text-sm md:text-base mb-4 border border-[#21808D]/20 shadow-sm backdrop-blur-sm">
                                <i className="fas fa-crown mr-2 text-yellow-500"></i>
                                Clean Master - كلين ماستر
                            </div>
                            
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[#13343B] drop-shadow-sm pb-4 leading-tight">
                                بيتك هيرجع <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#21808D] via-[#26A69A] to-[#1D7480] relative">
                                    ينوّر من تاني ✨
                                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FFD700] opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99992C18.5002 2.49992 48.5002 2.49992 48.5002 2.49992C92.0002 -1.00008 133 6.99992 198 6.99992" stroke="currentColor" strokeWidth="3"></path></svg>
                                </span>
                            </h1>
                        </div>

                        <h2 className="text-xl md:text-3xl font-bold text-[#626C71] mb-10 animate-fadeInUp delay-100 max-w-3xl mx-auto leading-relaxed">
                            ✨ رائد خدمات التنظيف في مصر ✨
                            <br className="hidden md:block mt-2"/>
                            <span className="font-medium text-lg text-[#21808D]">بنستخدم أحدث الأجهزة والمعدات 🛠️ عشان راحتك ونظافة بيتك 🏡 تهمنا.</span>
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fadeInUp delay-300">
                            
                            {/* Smart Booking Button */}
                            <button
                                onClick={() => appContext?.openChatBot()}
                                className="group relative px-8 py-5 bg-gradient-to-r from-[#21808D] to-[#1D7480] text-white rounded-2xl font-bold text-xl shadow-[0_10px_20px_rgba(33,128,141,0.3)] hover:shadow-[0_15px_30px_rgba(33,128,141,0.4)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <i className="fas fa-robot text-2xl animate-pulse"></i> 
                                    احجز بذكاء (شات بوت) 🤖
                                </span>
                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
                            </button>
                            
                            {/* Browse Services Button */}
                            <button
                                onClick={handleScrollToServices}
                                className="px-8 py-5 bg-white text-[#13343B] border-2 border-[#E0F7FA] rounded-2xl font-bold text-xl shadow-sm hover:shadow-lg hover:border-[#21808D] hover:text-[#21808D] transition-all duration-300 flex items-center gap-2 justify-center"
                            >
                                <i className="fas fa-magic text-yellow-500"></i> تصفح الخدمات
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
