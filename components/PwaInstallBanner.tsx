import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed',
        platform: string
    }>;
    prompt(): Promise<void>;
}

const PwaInstallBanner: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Delay showing the banner for better UX
            setTimeout(() => {
                setShouldRender(true);
                // Small timeout to allow render before animation starts
                setTimeout(() => setIsVisible(true), 100);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        setIsVisible(false);
        setTimeout(() => setShouldRender(false), 500); // Wait for animation
        await deferredPrompt.prompt();
        setDeferredPrompt(null);
    };

    const handleDismissClick = () => {
        setIsVisible(false);
        setTimeout(() => setShouldRender(false), 500);
    };

    if (!shouldRender) return null;

    return (
        <div 
            className={`fixed top-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[9999] transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        >
            <div className="glass-card p-4 rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.2)] bg-gradient-to-r from-[#21808D]/90 to-[#1D7480]/90 backdrop-blur-md">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/20 overflow-hidden">
                        <img 
                            src="https://i.ibb.co/f52dPHc/1000049048.jpg" 
                            alt="Clean Master"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-grow">
                        <h4 className="text-white font-bold text-sm mb-1">ثبّت تطبيق كلين ماستر 📱</h4>
                        <p className="text-white/80 text-xs mb-3">لتجربة أسرع وسهولة في الحجز ومتابعة الطلبات.</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleInstallClick}
                                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#21808D] shadow-sm hover:bg-gray-100 transition-colors"
                            >
                                تثبيت الآن
                            </button>
                            <button 
                                onClick={handleDismissClick}
                                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/30 text-white hover:bg-white/10 transition-colors"
                            >
                                ليس الآن
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PwaInstallBanner;