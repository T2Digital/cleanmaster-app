
import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "جاري المعالجة..." }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-[9999] text-white">
            <div className="w-10 h-10 border-4 border-white/30 border-t-[#21808D] rounded-full animate-spin mb-4"></div>
            <p>{message}</p>
        </div>
    );
};

export default LoadingSpinner;
