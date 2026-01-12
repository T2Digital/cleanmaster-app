import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
    prompt(): Promise<void>;
}

const PwaInstallBanner: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
        
        setIsIOS(isIOSDevice && !isStandalone);

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show banner after 5 seconds for new users
            const isDismissed = localStorage.getItem('pwa_banner_dismissed');
            if (!isDismissed) {
                setTimeout(() => setIsVisible(true), 5000);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        
        // If iOS and not dismissed, show it too
        if (isIOSDevice && !isStandalone && !localStorage.getItem('pwa_banner_dismissed')) {
            setTimeout(() => setIsVisible(true), 5000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        setIsVisible(false);
        await deferredPrompt.prompt();
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa_banner_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-[360px] z-[9999] animate-fadeInUp">
            <div className="bg-gradient-to-br from-[#13343B] to-[#1D7480] p-5 rounded-3xl shadow-2xl border border-white/10 text-white relative overflow-hidden">
                {/* Decoration Bubbles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                
                <div className="flex gap-4 items-start relative z-10">
                    <img src="https://i.ibb.co/f52dPHc/1000049048.jpg" className="w-14 h-14 rounded-2xl shadow-lg border border-white/20" alt="App Icon" />
                    <div className="flex-grow">
                        <h4 className="font-black text-sm mb-1">ثبّت تطبيق كلين ماستر 📱</h4>
                        <p className="text-[10px] opacity-80 leading-relaxed mb-3">احجز خدماتك أسرع بضغطة واحدة وتابع حالة طلباتك في أي وقت بدون متصفح.</p>
                        
                        {isIOS ? (
                            <div className="bg-white/10 p-2 rounded-xl border border-white/10 text-[9px] flex items-center gap-2">
                                <i className="fas fa-info-circle text-[#4DD0E1]"></i>
                                اضغط على أيقونة "مشاركة" <i className="fas fa-external-link-alt"></i> ثم اختر "إضافة للشاشة الرئيسية" (Add to Home Screen).
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={handleInstall} className="flex-grow bg-white text-[#21808D] py-2 rounded-xl font-black text-xs shadow-sm active:scale-95 transition-all">تثبيت الآن</button>
                                <button onClick={handleDismiss} className="px-4 py-2 border border-white/20 rounded-xl text-xs font-bold hover:bg-white/5 transition-all">لاحقاً</button>
                            </div>
                        )}
                    </div>
                    {isIOS && (
                        <button onClick={handleDismiss} className="text-white/50 hover:text-white"><i className="fas fa-times"></i></button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PwaInstallBanner;