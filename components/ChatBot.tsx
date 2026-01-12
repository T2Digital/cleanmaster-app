import React, { useState, useRef, useEffect, useContext } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration, Content } from "@google/genai";
import { appData } from '../constants';
import { createBooking } from '../api/bookingService';
import { AppContext } from '../App';
import { SelectedService, Booking, Photo } from '../types';

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
        // Use direct process.env.API_KEY which is injected by Vercel/Environment
        const apiKey = process.env.API_KEY;
        
        if (!apiKey || apiKey === "undefined") {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "عذراً، نظام الذكاء الاصطناعي غير مربوط حالياً (Missing API Key). يرجى التواصل عبر الواتساب مباشرة.", isError: true }]);
            setIsLoading(false);
            return;
        }

        const systemInstruction = `أنت مساعد شركة كلين ماستر (Clean Master Egypt) 🤖.
تحدث بلهجة مصرية مهذبة ومرحة. استخدم الرموز التعبيرية بكثرة ✨.
الهدف: مساعدة العميل في اختيار خدمات التنظيف وحجز موعد.
الخدمات المتاحة: ${services.map(s => s.name_ar).join(', ')}.
السياق الحالي للحجز: ${JSON.stringify(bookingContext)}`;

        const tools: FunctionDeclaration[] = [
            { name: 'request_date_time', description: 'Show date and time picker UI', parameters: { type: Type.OBJECT, properties: {} } },
            { name: 'finalize_booking', description: 'Confirm and save the booking in the system', parameters: { type: Type.OBJECT, properties: { customerName: {type:Type.STRING}, phone: {type:Type.STRING}, address: {type:Type.STRING} }, required: ['customerName', 'phone', 'address'] } }
        ];

        try {
            // Re-initialize for each turn to ensure fresh state and key access
            const ai = new GoogleGenAI({ apiKey });
            const currentHistory = [...chatHistory];
            if (userText) currentHistory.push({ role: 'user', parts: [{ text: userText }] });

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp', // Use latest flash for speed
                contents: currentHistory,
                config: { 
                    systemInstruction,
                    tools: [{ functionDeclarations: tools }]
                }
            });

            const resContent = response.candidates?.[0]?.content;
            if (response.text) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text }]);
            }

            resContent?.parts?.forEach(part => {
                if (part.functionCall) {
                    const name = part.functionCall.name;
                    if (name === 'request_date_time') {
                        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', uiComponent: 'date-time-picker' }]);
                    } else if (name === 'finalize_booking') {
                        executeFinalizeBooking(part.functionCall.args);
                    }
                }
            });

            if (resContent) setChatHistory([...currentHistory, resContent]);
        } catch (e) {
            console.error("AI Error:", e);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "عذراً، واجهت مشكلة في التفكير 🤯. هل يمكنك تكرار طلبك أو الضغط على أزرار الخيارات؟", isError: true }]);
        } finally { setIsLoading(false); }
    };

    const executeFinalizeBooking = async (args: any) => {
        const finalData = { ...bookingContext, ...args, status: 'new' as const, timestamp: new Date().toISOString() };
        try {
            const newBooking = await createBooking(finalData);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: `✅ مبروك! تم تسجيل حجزك برقم #${newBooking.bookingId}. الخطوة الأخيرة هي إرسال الفاتورة للواتساب لتأكيد الموعد.`, 
                isInvoice: true, 
                whatsappLink: `https://wa.me/${appData.config.whatsapp_number}?text=فاتورة حجز #${newBooking.bookingId}` 
            }]);
        } catch (e) { appContext?.showMessage("عذراً، فشل حفظ الحجز", "error"); }
    };

    const handleServiceSelect = (id: string) => {
        const s = services.find(x => x.id === id);
        if (!s) return;
        setBookingContext(prev => ({ ...prev, services: [...(prev.services || []), { ...s, quantity: 1, totalPrice: s.price }] }));
        setMessages(prev => [...prev, 
            { id: Date.now().toString(), role: 'user', text: `محتاج خدمة: ${s.name_ar}` }, 
            { id: (Date.now()+1).toString(), role: 'model', text: `تمام جداً، محتاج ${s.type === 'meter' ? 'كام متر' : 'كام قطعة'}؟`, uiComponent: 'quantity-input' }
        ]);
    };

    const handleQuantitySubmit = (q: number) => {
        setBookingContext(prev => {
            const servicesCopy = [...(prev.services || [])];
            const last = servicesCopy[servicesCopy.length - 1];
            if (last) {
                last.quantity = q;
                last.totalPrice = last.price * q;
            }
            return { ...prev, services: servicesCopy };
        });
        setMessages(prev => [...prev, 
            { id: Date.now().toString(), role: 'user', text: `${q}` }, 
            { id: (Date.now()+1).toString(), role: 'model', text: 'تحب تضيف خدمة تانية ولا نكمل بيانات الحجز؟', uiComponent: 'cart-actions' }
        ]);
    };

    return (
        <>
            <button onClick={appContext?.toggleChatBot} className={`fixed bottom-6 left-6 z-[9990] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-gray-600 rotate-90' : 'bg-[#21808D] animate-bounce-slow'}`}>
                {isOpen ? <i className="fas fa-times text-white text-2xl"></i> : <i className="fas fa-robot text-white text-3xl"></i>}
            </button>
            <div className={`fixed bottom-24 left-6 z-[9990] w-[92vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col transition-all origin-bottom-left border border-gray-100 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                <div className="bg-[#21808D] p-5 rounded-t-3xl text-white flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse"><i className="fas fa-robot"></i></div>
                        <span className="font-bold text-sm">مساعد كلين ماستر الذكي ✨</span>
                    </div>
                    <button onClick={() => { setMessages([]); setChatHistory([]); setBookingContext({ services: [] }); }} className="text-white/60 hover:text-white transition-colors"><i className="fas fa-redo-alt text-xs"></i></button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#F8FAFB]">
                    {messages.map(m => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'} animate-fadeInUp`}>
                            <div className={`p-4 rounded-2xl max-w-[85%] text-xs shadow-sm ${m.role === 'user' ? 'bg-[#21808D] text-white rounded-bl-none' : 'bg-white border border-gray-100 text-gray-800 rounded-br-none'}`}>
                                {m.text && <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />}
                                
                                {m.uiComponent === 'service-selector' && (
                                    <div className="grid grid-cols-1 gap-2 mt-3">
                                        {services.map(s => <button key={s.id} onClick={() => handleServiceSelect(s.id)} className="p-3 border border-gray-100 rounded-xl bg-gray-50 text-[11px] font-bold hover:bg-[#21808D] hover:text-white transition-all text-right flex items-center justify-between">
                                            <span>{s.name_ar}</span>
                                            <i className={`${s.icon} opacity-50`}></i>
                                        </button>)}
                                    </div>
                                )}
                                
                                {m.uiComponent === 'quantity-input' && (
                                    <div className="mt-3 flex gap-2">
                                        <input type="number" id="bot-qty" defaultValue="1" className="w-20 border border-gray-200 rounded-lg px-3 py-1 text-gray-800 outline-none focus:border-[#21808D]" />
                                        <button onClick={() => handleQuantitySubmit(Number((document.getElementById('bot-qty') as any).value))} className="bg-[#21808D] text-white px-4 py-1 rounded-lg font-bold">تأكيد</button>
                                    </div>
                                )}

                                {m.uiComponent === 'cart-actions' && (
                                    <div className="mt-3 flex flex-col gap-2">
                                        <button onClick={() => processAIInteraction("إكمال بيانات الحجز")} className="w-full bg-[#21808D] text-white p-3 rounded-xl font-bold text-[11px] shadow-sm">🚀 إكمال بيانات الحجز</button>
                                        <button onClick={() => { setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', uiComponent: 'service-selector' }]); }} className="w-full bg-white border border-[#21808D] text-[#21808D] p-3 rounded-xl font-bold text-[11px]">➕ إضافة خدمة تانية</button>
                                    </div>
                                )}

                                {m.isInvoice && m.whatsappLink && (
                                    <a href={m.whatsappLink} target="_blank" className="block mt-4 bg-[#25D366] text-white p-3 rounded-xl font-black text-center shadow-lg transform active:scale-95 transition-all">
                                        <i className="fab fa-whatsapp mr-2 text-lg"></i> تأكيد الموعد واتساب
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-end animate-pulse">
                            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-br-none text-[10px] text-gray-400">
                                <i className="fas fa-circle-notch animate-spin mr-2"></i> جاري الكتابة...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if(inputText.trim()) { setMessages(prev => [...prev, {id: Date.now().toString(), role: 'user', text: inputText}]); processAIInteraction(inputText); setInputText(''); } }} className="p-4 border-t bg-white rounded-b-3xl flex gap-3 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
                    <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="اكتب سؤالك هنا..." className="flex-grow border border-gray-100 bg-gray-50 rounded-2xl px-5 py-3 text-xs outline-none focus:border-[#21808D] focus:bg-white transition-all" />
                    <button type="submit" className="bg-[#21808D] text-white w-12 h-12 rounded-2xl shadow-lg shadow-[#21808D]/20 active:scale-90 transition-all flex items-center justify-center">
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChatBot;