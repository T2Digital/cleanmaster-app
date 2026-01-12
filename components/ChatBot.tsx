import React, { useState, useRef, useEffect, useContext } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration, Content } from "@google/genai";
import { appData } from '../constants';
import { createBooking } from '../api/bookingService';
import { AppContext } from '../App';
import { SelectedService, Booking, Location, Photo } from '../types';

// --- Helper Functions for Image Upload ---
const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 1024;
            let width = image.width;
            let height = image.height;
            if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context failed'));
            ctx.drawImage(image, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                else reject(new Error('Blob failed'));
            }, 'image/jpeg', 0.8);
        };
        image.onerror = () => reject(new Error('Image load failed'));
    });
};

const uploadFileToImgBB = async (file: File): Promise<Photo | null> => {
    try {
        const compressedFile = await compressImage(file);
        const formData = new FormData();
        formData.append('image', compressedFile);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${appData.config.imgbb_api_key}`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        return result.success ? {
            url: result.data.url,
            thumb: result.data.thumb.url,
            title: result.data.title,
            delete_url: result.data.delete_url
        } : null;
    } catch (error) { return null; }
};

type UIComponentType = 'service-selector' | 'quantity-input' | 'cart-actions' | 'date-time-picker' | 'payment-selector' | 'image-uploader' | 'location-requester' | 'none';

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text?: string;
    uiComponent?: UIComponentType;
    uiData?: any;
    isError?: boolean;
    whatsappLink?: string;
    isInteracted?: boolean;
    isInvoice?: boolean;
}

const ChatBot: React.FC = () => {
    const appContext = useContext(AppContext);
    const isOpen = appContext?.isChatBotOpen || false;
    const services = appContext?.services || [];
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [bookingContext, setBookingContext] = useState<Partial<Booking>>({ services: [] });
    const [chatHistory, setChatHistory] = useState<Content[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && !hasOpenedBefore) {
            setHasOpenedBefore(true);
            setMessages([
                { id: '1', role: 'model', text: 'أهلاً بك في كلين ماستر! 👋✨\nأنا مساعدك الذكي 🤖، جاهز أساعدك تختار الخدمة وتحدد الموعد المناسب.\n\nمن فضلك اختر الخدمة اللي محتاجها من القائمة 👇' },
                { id: '2', role: 'model', uiComponent: 'service-selector' }
            ]);
        }
    }, [isOpen, hasOpenedBefore]);

    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, isLoading]);

    const processAIInteraction = async (userText: string) => {
        setIsLoading(true);
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "عذراً، مفتاح الذكاء الاصطناعي غير مفعل حالياً. يرجى استخدام نموذج الحجز السريع أو التواصل واتساب.", isError: true }]);
            setIsLoading(false);
            return;
        }

        const systemInstruction = `You are Clean Master Assistant 🤖. Speak Arabic (Egyptian). Always use Emojis.
        Current Context: ${JSON.stringify(bookingContext)}`;

        const tools: FunctionDeclaration[] = [
            { name: 'request_date_time', description: 'Show date picker', parameters: { type: Type.OBJECT, properties: {} } },
            { name: 'request_location', description: 'Show GPS requester', parameters: { type: Type.OBJECT, properties: {} } },
            { name: 'request_payment', description: 'Show payment methods', parameters: { type: Type.OBJECT, properties: {} } },
            { name: 'finalize_booking', description: 'Save booking', parameters: { type: Type.OBJECT, properties: { customerName: {type:Type.STRING}, phone: {type:Type.STRING}, address: {type:Type.STRING} }, required: ['customerName', 'phone'] } }
        ];

        try {
            const ai = new GoogleGenAI({ apiKey });
            const currentHistory = [...chatHistory];
            if (userText) currentHistory.push({ role: 'user', parts: [{ text: userText }] });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: currentHistory,
                config: { systemInstruction, tools: [{ functionDeclarations: tools }] }
            });

            const resContent = response.candidates?.[0]?.content;
            if (response.text) setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text }]);

            resContent?.parts?.forEach(part => {
                if (part.functionCall) {
                    const name = part.functionCall.name;
                    if (name === 'request_date_time') setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', uiComponent: 'date-time-picker' }]);
                    else if (name === 'request_location') setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', uiComponent: 'location-requester' }]);
                    else if (name === 'request_payment') setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', uiComponent: 'payment-selector' }]);
                    else if (name === 'finalize_booking') executeFinalizeBooking(part.functionCall.args);
                }
            });

            if (resContent) setChatHistory([...currentHistory, resContent]);
        } catch (e) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "حدث خطأ في الاتصال. يرجى المحاولة لاحقاً أو التأكد من إعدادات المفتاح.", isError: true }]);
        } finally { setIsLoading(false); }
    };

    const executeFinalizeBooking = async (args: any) => {
        const finalData = { ...bookingContext, ...args };
        try {
            const newBooking = await createBooking(finalData);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `✅ تم تأكيد حجزك بنجاح برقم #${newBooking.bookingId}. يمكنك الآن إرسال الفاتورة لواتساب لتأكيد الموعد نهائياً.`, isInvoice: true, whatsappLink: `https://wa.me/${appData.config.whatsapp_number}?text=فاتورة حجز #${newBooking.bookingId}` }]);
        } catch (e) { appContext?.showMessage("خطأ في الحفظ", "error"); }
    };

    const handleServiceSelect = (id: string) => {
        const s = services.find(x => x.id === id);
        if (!s) return;
        setBookingContext(prev => ({ ...prev, services: [...(prev.services || []), { ...s, quantity: 1, totalPrice: s.price }] }));
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: `اخترت: ${s.name_ar}` }, { id: (Date.now()+1).toString(), role: 'model', uiComponent: 'quantity-input' }]);
    };

    const handleQuantitySubmit = (q: number) => {
        setBookingContext(prev => {
            const last = prev.services![prev.services!.length - 1];
            const updated = { ...last, quantity: q, totalPrice: last.price * q };
            return { ...prev, services: [...prev.services!.slice(0, -1), updated] };
        });
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: `الكمية: ${q}` }, { id: (Date.now()+1).toString(), role: 'model', uiComponent: 'cart-actions' }]);
    };

    const handleActionComplete = () => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: '✅ إكمال الحجز' }]);
        processAIInteraction("إكمال الحجز");
    };

    return (
        <>
            <button onClick={appContext?.toggleChatBot} className={`fixed bottom-6 left-6 z-[9990] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-gray-600 rotate-90' : 'bg-[#21808D] animate-bounce-slow'}`}>
                {isOpen ? <i className="fas fa-times text-white text-2xl"></i> : <i className="fas fa-robot text-white text-3xl"></i>}
            </button>
            <div className={`fixed bottom-24 left-6 z-[9990] w-[90vw] md:w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all origin-bottom-left ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                <div className="bg-[#21808D] p-4 rounded-t-2xl text-white flex justify-between items-center">
                    <span className="font-bold">مساعد كلين ماستر الذكي 🤖</span>
                    <button onClick={() => setMessages([])}><i className="fas fa-sync-alt"></i></button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.map(m => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${m.role === 'user' ? 'bg-[#21808D] text-white' : 'bg-white border text-gray-800'}`}>
                                {m.text && <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />}
                                {m.uiComponent === 'service-selector' && !m.isInteracted && (
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {services.map(s => <button key={s.id} onClick={() => handleServiceSelect(s.id)} className="p-2 border rounded bg-gray-50 text-[10px] hover:bg-blue-50">{s.name_ar}</button>)}
                                    </div>
                                )}
                                {m.uiComponent === 'quantity-input' && !m.isInteracted && (
                                    <div className="mt-2 flex gap-2">
                                        <input type="number" id="bot-qty" defaultValue="1" className="w-20 border rounded px-2" />
                                        <button onClick={() => handleQuantitySubmit(Number((document.getElementById('bot-qty') as any).value))} className="bg-[#21808D] text-white px-3 py-1 rounded">تأكيد</button>
                                    </div>
                                )}
                                {m.uiComponent === 'cart-actions' && !m.isInteracted && (
                                    <button onClick={handleActionComplete} className="w-full mt-2 bg-green-600 text-white p-2 rounded">استكمال البيانات 🚀</button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="text-center text-xs text-gray-400">جاري التفكير... 🧠</div>}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={(e) => { e.preventDefault(); processAIInteraction(inputText); setInputText(''); }} className="p-3 border-t bg-white rounded-b-2xl flex gap-2">
                    <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="اكتب هنا..." className="flex-grow border rounded-xl px-4 py-2 outline-none focus:border-[#21808D]" />
                    <button type="submit" className="bg-[#21808D] text-white w-10 h-10 rounded-xl"><i className="fas fa-paper-plane"></i></button>
                </form>
            </div>
        </>
    );
};

export default ChatBot;