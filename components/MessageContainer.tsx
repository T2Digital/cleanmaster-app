
import React, { useEffect } from 'react';

interface Message {
    id: number;
    text: string;
    type: 'info' | 'success' | 'error';
}

interface MessageContainerProps {
    messages: Message[];
    removeMessage: (id: number) => void;
}

const MessageContainer: React.FC<MessageContainerProps> = ({ messages, removeMessage }) => {
    const typeClasses = {
        info: 'border-r-[#626C71]',
        success: 'border-r-[#21808D]',
        error: 'border-r-[#C0152F]',
    };

    useEffect(() => {
        const styleId = 'message-container-animation';
        if (document.getElementById(styleId)) {
            return;
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}`;
        document.head.appendChild(style);

        return () => {
            const styleElement = document.getElementById(styleId);
            if (styleElement) {
                document.head.removeChild(styleElement);
            }
        };
    }, []);

    return (
        <div className="fixed top-20 right-4 md:right-5 z-[9998] flex flex-col gap-2 w-11/12 max-w-md">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    onClick={() => removeMessage(msg.id)}
                    className={`p-4 rounded-lg shadow-lg bg-[#FCFCF9] text-[#13343B] border-r-4 cursor-pointer animate-slideIn ${typeClasses[msg.type]}`}
                >
                    {msg.text}
                </div>
            ))}
        </div>
    );
};

export default MessageContainer;
