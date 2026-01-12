import React, { useState, useRef, useEffect, useContext } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration, Content } from "@google/genai";
import { appData } from '../constants';
import { createBooking } from '../api/bookingService';
import { AppContext } from '../App';
import { Booking } from '../types';

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text?: string;
    uiComponent?: 'service-selector' | 'quantity-input' | 'cart-actions' | 'date-time-picker' | 'none';
    isError?: boolean;
    isInvoice?: boolean;
    whatsappLink?: string;
}

const ChatBot: React.FC = () => {
    const appContext = useContext(AppContext);
    const isOpen = appContext?.isChatBotOpen || false;
    const services = appContext?.services || [];
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [bookingContext, setBookingContext] = useState<Partial<Booking>>({ services: [] });
    const [chatHistory, setChatHistory] = useState<Content[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { id: '1', role: 'model', text: 'أهلاً بك في كلين ماستر! 👋✨\nأنا مساعدك الذكي 🤖، جاهز أساعدك تختار الخدمة وتحدد الموعد المناسب.' },
                { id: '2', role: 'model', uiComponent: 'service-selector' }
            ]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const processAIInteraction = async (userText: string) => {
        if (!userText.trim()) return;
        
        // Accessing API KEY with a fallback to check if it's literally the string "undefined"
        const apiKey = process.env.API_KEY;
        
        if (!apiKey || apiKey === "undefined") {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "⚠️ عذراً، لم يتم العثور على مفتاح الربط للذكاء الاصطناعي في بيئة الاستضافة. يرجى التواصل معنا عبر الواتساب لإتمام الحجز.", isError: true }]);
            return;
        }

        setIsLoading(true);
        const systemInstruction = `أنت مساعد ذكي لشركة كلين ماستر للتنظيف بمصر. تحدث بلهجة مصرية مهذبة. الخدمات: ${services.map(s => s.name_ar).join(', ')}`;

        try {
            const ai = new GoogleGenAI({ apiKey });
            const currentHistory = [...chatHistory];
            currentHistory.push({ role: 'user', parts: [{ text: userText }] });

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: currentHistory,
                config: { systemInstruction }
            });

            const aiResponse = response.text || "موجود، كيف أساعدك؟";
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: aiResponse }]);
            setChatHistory([...currentHistory, { role: 'model', parts: [{ text: aiResponse }] }]);
        } catch (e) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "حدث خطأ في الاتصال بالسيرفر. يرجى المحاولة مرة أخرى.", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceSelect = (id: string) => {
        const s = services.find(x => x.id === id);
        if (!s) return;
        setBookingContext(prev => ({ ...prev, services: [...(prev.services || []), { ...s, quantity: 1, totalPrice: s.price }] }));
        setMessages(prev => [...prev, 
            { id: Date.now().toString(), role: 'user', text: `أريد حجز: ${s.name_ar}` },
            { id: (Date.now()+1).toString(), role: 'model', text: `تمام، محتاج ${s.type === 'meter' ? 'كام متر' : 'كام قطعة'}؟`, uiComponent: 'quantity-input' }
        ]);
    };

    const handleQuantitySubmit = (q: number) => {
        setBookingContext(prev => {
            const copy = [...(prev.services || [])];
            if (copy.length) {
                copy[copy.length-1].quantity = q;
                copy[copy.length-1].totalPrice = copy[copy.length-1].price * q;
            }
            return { ...prev, services: copy };
        });
        setMessages(prev => [...prev, 
            { id: Date.now().toString(), role: 'user', text: `${q}` },
            { id: (Date.now()+1).toString(), role: 'model', text: 'تمام، هل تريد إضافة شيء آخر؟', uiComponent: 'cart-actions' }
        ]);
    };

    return (
        <>
            <button onClick={appContext?.toggleChatBot} className={`fixed bottom-6 left-6 z-[9990] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all bg-[#21808D] ${isOpen ? 'rotate-90' : ''}`}>
                {isOpen ? <i className="fas fa-times text-white text-2xl"></i> : <i className="fas fa-robot text-white text-3xl"></i>}
            </button>
            
            <div className={`fixed bottom-24 left-6 z-[9990] w-[92vw] md:w-[380px] h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col transition-all border border-gray-100 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                <div className="bg-[#21808D] p-4 rounded-t-3xl text-white flex items-center gap-3">
                    <i className="fas fa-robot"></i>
                    <span className="font-bold text-sm">مساعد كلين ماستر ✨</span>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map(m => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`p-3 rounded-2xl max-w-[85%] text-xs shadow-sm ${m.role === 'user' ? 'bg-[#21808D] text-white rounded-bl-none' : 'bg-white border text-gray-800 rounded-br-none'}`}>
                                {m.text && <p>{m.text}</p>}
                                
                                {m.uiComponent === 'service-selector' && (
                                    <div className="flex flex-col gap-1 mt-2">
                                        {services.map(s => <button key={s.id} onClick={() => handleServiceSelect(s.id)} className="p-2 border rounded-lg text-right text-[10px] bg-gray-50 hover:bg-blue-50">{s.name_ar}</button>)}
                                    </div>
                                )}
                                
                                {m.uiComponent === 'quantity-input' && (
                                    <div className="mt-2 flex gap-2">
                                        <input type="number" id="q-in" defaultValue="1" className="w-16 border rounded px-2" />
                                        <button onClick={() => handleQuantitySubmit(Number((document.getElementById('q-in') as any).value))} className="bg-[#21808D] text-white px-3 py-1 rounded">تأكيد</button>
                                    </div>
                                )}

                                {m.uiComponent === 'cart-actions' && (
                                    <div className="mt-2 flex flex-col gap-2">
                                        <button onClick={() => processAIInteraction("إكمال الحجز")} className="bg-[#21808D] text-white p-2 rounded-lg font-bold">🚀 إكمال الحجز</button>
                                        <button onClick={() => setMessages(prev => [...prev, {id: Date.now().toString(), role: 'model', uiComponent: 'service-selector'}])} className="border border-[#21808D] text-[#21808D] p-2 rounded-lg text-[10px]">➕ إضافة خدمة أخرى</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="text-center text-[10px] text-gray-400">جاري التفكير... 🧠</div>}
                    <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); if(inputText) { setMessages(prev => [...prev, {id: Date.now().toString(), role: 'user', text: inputText}]); processAIInteraction(inputText); setInputText(''); } }} className="p-3 border-t bg-white rounded-b-3xl flex gap-2">
                    <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="اكتب سؤالك..." className="flex-grow border rounded-xl px-4 py-2 text-xs outline-none focus:border-[#21808D]" />
                    <button type="submit" className="bg-[#21808D] text-white w-10 h-10 rounded-xl flex items-center justify-center">
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChatBot;