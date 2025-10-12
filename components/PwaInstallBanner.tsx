
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

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        setIsVisible(false);
        await deferredPrompt.prompt();
        // userChoice property is no longer available, but we can keep the rest of the logic
        setDeferredPrompt(null);
    };

    const handleDismissClick = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#21808D] to-[#297480] text-white p-3 z-[1000] shadow-md">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-right">
                <div className="flex items-center gap-4">
                    <i className="fas fa-download text-xl"></i>
                    <span className="font-medium">قم بتثبيت تطبيق كلين ماستر للحصول على أفضل تجربة</span>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleInstallClick}
                        className="px-4 py-1.5 rounded-md text-sm font-medium bg-white text-[#21808D] transition-colors hover:bg-gray-100"
                    >
                        تثبيت
                    </button>
                    <button 
                        onClick={handleDismissClick}
                        className="px-4 py-1.5 rounded-md text-sm font-medium border border-white/50 text-white transition-colors hover:bg-white/10"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PwaInstallBanner;
