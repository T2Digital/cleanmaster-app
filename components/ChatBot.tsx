import React, { useState, useRef, useEffect, useContext } from 'react';
import { GoogleGenAI, Content } from "@google/genai";
import { AppContext } from '../App';

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text?: string;
    uiComponent?: 'service-selector' | 'quantity-input' | 'cart-actions' | 'none';
    isError?: boolean;
}

const ChatBot: React.FC = () => {
    const appContext = useContext(AppContext);
    const isOpen = appContext?.isChatBotOpen || false;
    const services = appContext?.services || [];
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
        
        // Exclusively get API_KEY from process.env
        const apiKey = process.env.API_KEY;
        
        if (!apiKey || apiKey === "undefined") {
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: "⚠️ عذراً، مساعد الذكاء الاصطناعي يتطلب مفتاح API للعمل. يرجى إتمام حجزك يدوياً عبر الموقع أو الواتساب.", 
                isError: true 
            }]);
            return;
        }

        setIsLoading(true);
        const systemInstruction = `أنت مساعد ذكي لشركة كلين ماستر للتنظيف بمصر. تحدث بلهجة مصرية مهذبة. الخدمات المتاحة: ${services.map(s => s.name_ar).join(', ')}. هدفك مساعدة العميل في اختيار الخدمة المناسبة وحجزها.`;

        try {
            // ALWAYS use named parameter for apiKey during initialization
            const ai = new GoogleGenAI({ apiKey });
            const currentHistory = [...chatHistory];
            currentHistory.push({ role: 'user', parts: [{ text: userText }] });

            // Using gemini-3-flash-preview for general tasks as per guidelines
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: currentHistory,
                config: { systemInstruction }
            });

            const aiResponse = response.text || "أنا معك، كيف يمكنني مساعدتك اليوم؟";
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: aiResponse }]);
            setChatHistory([...currentHistory, { role: 'model', parts: [{ text: aiResponse }] }]);
        } catch (e) {
            console.error("Gemini API Error:", e);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "حدث خطأ أثناء محاولة الاتصال بذكاء التطبيق. يمكنك تجربة الحجز يدوياً بالضغط على زر الحجز.", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceSelect = (id: string) => {
        const s = services.find(x => x.id === id);
        if (!s) return;
        setMessages(prev => [...prev, 
            { id: Date.now().toString(), role: 'user', text: `أريد حجز: ${s.name_ar}` },
            { id: (Date.now()+1).toString(), role: 'model', text: `تمام، محتاج ${s.type === 'meter' ? 'كام متر' : 'كام قطعة'}؟`, uiComponent: 'quantity-input' }
        ]);
    };

    const handleQuantitySubmit = (q: number) => {
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
                            <div className={`p-3 rounded-2xl max-w-[85%] text-xs shadow-sm ${m.role === 'user' ? 'bg-[#21808D] text-white rounded-bl-none' : 'bg-white border text-gray-800 rounded-br-none'} ${m.isError ? 'border-red-300 bg-red-50 text-red-600' : ''}`}>
                                {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                                
                                {m.uiComponent === 'service-selector' && (
                                    <div className="flex flex-col gap-1 mt-2">
                                        {services.map(s => <button key={s.id} onClick={() => handleServiceSelect(s.id)} className="p-2 border rounded-lg text-right text-[10px] bg-gray-50 hover:bg-blue-50 transition-colors">{s.name_ar}</button>)}
                                    </div>
                                )}
                                
                                {m.uiComponent === 'quantity-input' && (
                                    <div className="mt-2 flex gap-2">
                                        <input type="number" id="chat-q-in" defaultValue="1" className="w-16 border rounded px-2 text-center" />
                                        <button onClick={() => handleQuantitySubmit(Number((document.getElementById('chat-q-in') as any).value))} className="bg-[#21808D] text-white px-3 py-1 rounded hover:bg-[#1D7480]">تأكيد</button>
                                    </div>
                                )}

                                {m.uiComponent === 'cart-actions' && (
                                    <div className="mt-2 flex flex-col gap-2">
                                        <button onClick={() => appContext?.openBookingModal()} className="bg-[#21808D] text-white p-2 rounded-lg font-bold shadow-sm">🚀 إتمام الحجز الآن</button>
                                        <button onClick={() => setMessages(prev => [...prev, {id: Date.now().toString(), role: 'model', uiComponent: 'service-selector'}])} className="border border-[#21808D] text-[#21808D] p-2 rounded-lg text-[10px] bg-white">➕ إضافة خدمة أخرى</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="text-center text-[10px] text-gray-400 animate-pulse">جاري التفكير... 🧠</div>}
                    <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); if(inputText) { setMessages(prev => [...prev, {id: Date.now().toString(), role: 'user', text: inputText}]); processAIInteraction(inputText); setInputText(''); } }} className="p-3 border-t bg-white rounded-b-3xl flex gap-2">
                    <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="اكتب سؤالك هنا..." className="flex-grow border rounded-xl px-4 py-2 text-xs outline-none focus:border-[#21808D] transition-all" />
                    <button type="submit" className="bg-[#21808D] text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#1D7480] transition-colors shadow-md">
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChatBot;