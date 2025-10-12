
import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: 'default' | 'large';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = 'default' }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!isOpen) return null;
    
    const sizeClasses = {
        default: 'max-w-xl',
        large: 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className={`bg-[#FCFCF9] rounded-lg relative z-10 w-11/12 max-h-[90vh] overflow-y-auto shadow-lg ${sizeClasses[size]}`}>
                <button 
                    onClick={onClose}
                    className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#5E5240]/[0.12] text-[#13343B] hover:bg-[#5E5240]/[0.2] transition-colors z-20"
                    aria-label="Close modal"
                >
                    <i className="fas fa-times"></i>
                </button>
                <div className="p-6 md:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
