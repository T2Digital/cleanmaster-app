
import React, { useState, useRef, useEffect } from 'react';
import { BeforeAfterImage } from '../types';

interface BeforeAfterSliderProps {
    item: BeforeAfterImage;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ item }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            setSliderPosition(percentage);
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            setSliderPosition(percentage);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-[#13343B]">{item.label}</h3>
            <div 
                ref={containerRef}
                className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-2xl cursor-col-resize select-none border-4 border-white"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
            >
                {/* Before Image (Background) */}
                <img 
                    src={item.before} 
                    alt="Before" 
                    className="absolute top-0 left-0 w-full h-full object-cover" 
                />
                
                {/* After Image (Foreground - Clipped) */}
                <div 
                    className="absolute top-0 left-0 w-full h-full overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <img 
                        src={item.after} 
                        alt="After" 
                        className="absolute top-0 left-0 w-full h-full object-cover" 
                    />
                </div>

                {/* Slider Handle */}
                <div 
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    style={{ left: `${sliderPosition}%` }}
                >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-[#21808D]">
                        <i className="fas fa-arrows-alt-h text-xs"></i>
                    </div>
                </div>

                {/* Labels */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm font-bold backdrop-blur-sm">
                    بعد
                </div>
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm font-bold backdrop-blur-sm">
                    قبل
                </div>
            </div>
        </div>
    );
};

export default BeforeAfterSlider;
