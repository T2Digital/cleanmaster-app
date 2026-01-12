
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
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(image, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                else reject(new Error('Canvas to Blob failed'));
            }, 'image/jpeg', 0.8);
        };
        image.onerror = (e) => reject(new Error('Image load failed'));
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
        if (result.success) {
            return {
                url: result.data.url,
                thumb: result.data.thumb.url,
                title: result.data.title,
                delete_url: result.data.delete_url
            };
        }
        return null;
    } catch (error) {
        console.error("Upload failed", error);
        return null;
    }
};

// --- Types ---
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
    
    // Context needed for booking
    const [bookingContext, setBookingContext] = useState<Partial<Booking>>({ services: [] });
    
    // Gemini History
    const [chatHistory, setChatHistory] = useState<Content[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial greeting logic
    useEffect(() => {
        if (isOpen && !hasOpenedBefore) {
            setHasOpenedBefore(true);
            const initialMsgs: ChatMessage[] = [
                { id: Date.now().toString(), role: 'model', text: 'أهلاً بك في كلين ماستر! 👋✨\nأنا مساعدك الذكي 🤖، جاهز أساعدك تختار الخدمة وتحدد الموعد المناسب.\n\nمن فضلك اختر الخدمة اللي محتاجها من القائمة 👇' },
                { id: (Date.now() + 1).toString(), role: 'model', uiComponent: 'service-selector' }
            ];
            setMessages(initialMsgs);
        }
    }, [isOpen, hasOpenedBefore]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages, isOpen]);

    const handleReset = () => {
        if (window.confirm("هل أنت متأكد من مسح المحادثة والبدء من جديد؟ 🔄")) {
            // Reset ALL states
            setBookingContext({ services: [] });
            setChatHistory([]);
            setInputText('');
            setIsLoading(false);
            setHasOpenedBefore(true); // Ensure we don't duplicate logic
            
            // Force reset messages immediately
            const initialMsgs: ChatMessage[] = [
                { id: Date.now().toString(), role: 'model', text: 'أهلاً بك مجدداً! 👋✨\nلنبدأ من جديد، يرجى اختيار الخدمة المطلوبة 👇' },
                { id: (Date.now() + 1).toString(), role: 'model', uiComponent: 'service-selector' }
            ];
            setMessages(initialMsgs);
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        appContext?.showMessage('تم نسخ الرقم بنجاح! ✅', 'success');
    };

    // --- UI Action Handlers ---

    const handleServiceSelect = (serviceId: string) => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return;

        // Mark previous selector as interacted
        setMessages(prev => prev.map(m => m.uiComponent === 'service-selector' ? { ...m, isInteracted: true } : m));
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: `اخترت خدمة: ${service.name_ar} ✨` };
        setMessages(prev => [...prev, userMsg]);
        
        // Add service to cart with initial quantity 1 (will be updated by quantity input)
        setBookingContext(prev => {
            const currentServices = prev.services || [];
            return { ...prev, services: [...currentServices, { ...service, quantity: 1, totalPrice: service.price }] };
        });

        // Determine prompt based on type
        if (service.type === 'consultation') {
            handleQuantitySubmit(1); // Auto submit for consultation
        } else {
            // Ask for quantity directly via UI
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                uiComponent: 'quantity-input', 
                uiData: { label: service.type === 'meter' ? 'أدخل المساحة بالمتر' : 'أدخل العدد المطلوب' } 
            }]);
        }
    };

    const handleQuantitySubmit = (quantity: number) => {
        setMessages(prev => prev.map(m => m.uiComponent === 'quantity-input' ? { ...m, isInteracted: true } : m));
        
        // Update the last added service
        const currentServices = [...(bookingContext.services || [])];
        if (currentServices.length === 0) return;
        
        const lastServiceIndex = currentServices.length - 1;
        const currentService = currentServices[lastServiceIndex];
        
        const totalPrice = currentService.price * quantity;
        const unit = currentService.type === 'meter' ? 'متر' : 'عدد';
        
        currentServices[lastServiceIndex] = { ...currentService, quantity, totalPrice };

        setBookingContext(prev => ({ ...prev, services: currentServices }));

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: `الكمية: ${quantity} ${unit} 📏` };
        setMessages(prev => [...prev, userMsg]);

        // Display summary and action buttons
        setMessages(prev => [...prev, 
            { id: (Date.now()+1).toString(), role: 'model', uiComponent: 'cart-actions' }
        ]);
    };

    const handleRemoveService = (index: number) => {
        setBookingContext(prev => {
            const currentServices = [...(prev.services || [])];
            currentServices.splice(index, 1);
            return { ...prev, services: currentServices };
        });
        
        // Refresh the cart-actions view by forcing a re-render of the component
        // Since the UI component reads directly from bookingContext, it should update.
    };

    const handleActionAddService = () => {
        setMessages(prev => prev.map(m => m.uiComponent === 'cart-actions' ? { ...m, isInteracted: true } : m));
        setMessages(prev => [...prev, 
            { id: Date.now().toString(), role: 'user', text: '➕ إضافة خدمة أخرى' },
            { id: (Date.now()+1).toString(), role: 'model', uiComponent: 'service-selector' }
        ]);
    };

    const handleActionComplete = () => {
        if (!bookingContext.services || bookingContext.services.length === 0) {
            appContext?.showMessage("يجب اختيار خدمة واحدة على الأقل", "error");
            return;
        }

        setMessages(prev => prev.map(m => m.uiComponent === 'cart-actions' ? { ...m, isInteracted: true } : m));
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: '✅ إكمال الحجز' };
        setMessages(prev => [...prev, userMsg]);
        
        // Trigger AI to move to next step (Date/Time)
        processAIInteraction("تم تأكيد الخدمات. انتقل لاختيار الموعد.");
    };

    const handleDateTimeSelect = (date: string, time: string) => {
        setMessages(prev => prev.map(m => m.uiComponent === 'date-time-picker' ? { ...m, isInteracted: true } : m));
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: `الموعد: ${date} الساعة ${time} 📅` };
        setMessages(prev => [...prev, userMsg]);

        setBookingContext(prev => ({ ...prev, date, time }));
        processAIInteraction(`تم تحديد الموعد: ${date} - ${time}. انتقل لبيانات الموقع.`);
    };

    const handleLocationShared = (loc: Location) => {
        setMessages(prev => prev.map(m => m.uiComponent === 'location-requester' ? { ...m, isInteracted: true } : m));
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: `تمت مشاركة الموقع: ${loc.url} 📍` };
        setMessages(prev => [...prev, userMsg]);

        setBookingContext(prev => ({ ...prev, location: loc }));
        processAIInteraction(`تم تحديد الموقع GPS. الآن العنوان النصي (اسم الشارع ورقم العمارة) أصبح **اختيارياً** ولكن يفضل طلبه للتأكيد.`);
    };

    const handleSkipStep = (type: 'location' | 'photos') => {
        setMessages(prev => prev.map(m => 
            (type === 'location' && m.uiComponent === 'location-requester') || 
            (type === 'photos' && m.uiComponent === 'image-uploader')
            ? { ...m, isInteracted: true } : m
        ));

        if (type === 'location') {
             const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: 'سأكتب العنوان يدوياً 📝' };
             setMessages(prev => [...prev, userMsg]);
             processAIInteraction('User skipped GPS. You MUST ask for the text address (MANDATORY in this case).');
        } else {
             const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: 'لا توجد صور ⏭️' };
             setMessages(prev => [...prev, userMsg]);
             processAIInteraction('User skipped photos. Proceed to payment.');
        }
    };

    const handlePaymentSelect = (method: 'cash' | 'electronic') => {
        setMessages(prev => prev.map(m => m.uiComponent === 'payment-selector' ? { ...m, isInteracted: true } : m));
        
        const text = method === 'cash' ? '💵 دفع نقدي' : '💳 دفع إلكتروني';
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
        setMessages(prev => [...prev, userMsg]);

        setBookingContext(prev => ({ ...prev, paymentMethod: method }));
        
        const currentServices = bookingContext.services || [];
        const basePrice = currentServices.reduce((acc, s) => acc + s.totalPrice, 0);

        if (method === 'electronic') {
            const discountAmount = basePrice * (appData.config.discount_percentage / 100);
            const netPrice = basePrice - discountAmount;
            const advancePayment = netPrice * 0.25;
            const remainingBalance = netPrice - advancePayment;

            processAIInteraction(`تم اختيار الدفع الإلكتروني. 
            قيمة الخدمات: **${basePrice} جنيه**.
            بعد خصم 10% (**${discountAmount} جنيه**)، الصافي: **${netPrice} جنيه**.
            مطلوب تحويل مبلغ جدية حجز (25% من الصافي) وقيمته: **${advancePayment} جنيه**.
            المبلغ المتبقي للدفع عند الاستلام: **${remainingBalance} جنيه**.
            أخبر العميل بهذه الأرقام بوضوح (Bold)، واطلب تحويل الـ **${advancePayment} جنيه** على رقم **${appData.company_info.payment_number}** (إنستا باي / محفظة) ثم اطلب رفع صورة التحويل.`);
        } else {
            processAIInteraction(`تم اختيار الدفع النقدي.
            إجمالي المبلغ المستحق للدفع بعد إنهاء الخدمة هو: **${basePrice} جنيه**.
            أخبر العميل بهذا المبلغ بوضوح. ثم اطلب الاسم والهاتف لإنهاء الحجز.`);
        }
    };

    const handleImagesUploaded = (photos: Photo[], isProof: boolean) => {
         setMessages(prev => prev.map(m => m.uiComponent === 'image-uploader' ? { ...m, isInteracted: true } : m));
         
         const text = isProof ? '✅ تم رفع إثبات الدفع' : `📸 تم رفع ${photos.length} صور`;
         const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
         setMessages(prev => [...prev, userMsg]);

         if (isProof) {
             setBookingContext(prev => ({ ...prev, paymentProof: photos[0] }));
             processAIInteraction(`تم رفع إثبات الدفع (${photos[0].url}). اطلب الاسم والهاتف لإنهاء الحجز.`);
         } else {
             const photoUrls = photos.map(p => p.url).join(', ');
             setBookingContext(prev => ({ ...prev, photos: [...(prev.photos || []), ...photos] }));
             processAIInteraction(`تم رفع صور المكان: ${photoUrls}. استمر.`);
         }
    };

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>, isProof: boolean) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsLoading(true);
            try {
                const filesArray = Array.from(e.target.files) as File[];
                const uploadPromises = filesArray.map((f: File) => uploadFileToImgBB(f));
                const uploads = await Promise.all(uploadPromises);
                
                const valid = uploads.filter((u): u is Photo => u !== null);
                
                if (valid.length > 0) {
                    handleImagesUploaded(valid, isProof);
                } else {
                    appContext?.showMessage('فشل رفع الصور. يرجى المحاولة مرة أخرى.', 'error');
                }
            } catch (error) {
                console.error("Error handling files", error);
                appContext?.showMessage('حدث خطأ أثناء معالجة الصور', 'error');
            } finally {
                setIsLoading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    // --- AI Logic ---

    const processAIInteraction = async (userText: string) => {
        setIsLoading(true);

        const systemInstruction = `
            You are "Clean Master Assistant" 🤖. 
            Your goal: Guide user to book a service using UI TOOLS.
            Language: Arabic (Egyptian dialect allowed).
            Tone: Friendly, professional, and ALWAYS use Emojis (✨, 🧹, 🏡, ✅, etc) in every response.
            Format numbers in bold like **100**.
            
            Company Data:
            - Payment Number: **${appData.company_info.payment_number}** (Supports Instapay & Wallet).
            - Electronic Payment Discount: ${appData.config.discount_percentage}%.
            - Advance Payment: 25% of the NET amount (after discount).
            
            RULES:
            1. Services & Quantity are handled manually by UI now. Focus on the flow AFTER services are confirmed.
            2. If user says "Complete Booking", Call 'request_date_time'.
            3. Call 'request_location' (For GPS).
            4. ADDRESS LOGIC:
               - If user shared GPS (in context.location): Address text is OPTIONAL.
               - If user SKIPPED GPS: Address text is MANDATORY. You must ask for it.
            5. Call 'request_place_photos' (Optional).
            6. Call 'request_payment'.
            7. Payment Logic:
               - If Electronic: State Net Total, Advance Payment (25%), and REMAINING balance. Show number & ask for proof using 'request_payment_proof'.
               - If Cash: State the Total Amount clearly.
            8. Call 'finalize_booking' (requires Name, Phone, and Address (if mandatory)).
            
            Current Context: ${JSON.stringify(bookingContext)}
        `;

        const tools: FunctionDeclaration[] = [
            { name: 'show_services', description: 'Show services list', parameters: { type: Type.OBJECT, properties: {} } },
            { name: 'request_date_time', description: 'Show date picker', parameters: { type: Type.OBJECT, properties: {} } },
            { name: 'request_location', description: 'Show location button (Optional GPS)', parameters: { type: Type.OBJECT, properties: {} } },
            { name: 'request_place_photos', description: 'Show photo uploader', parameters: { type: Type.OBJECT, properties: {} } },
            { name: 'request_payment', description: 'Show payment options', parameters: { type: Type.OBJECT, properties: {} } },
            { name: 'request_payment_proof', description: 'Show proof uploader', parameters: { type: Type.OBJECT, properties: {} } },
            {
                name: 'finalize_booking',
                description: 'Save booking',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        customerName: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        address: { type: Type.STRING },
                        notes: { type: Type.STRING }
                    },
                    required: ['customerName', 'phone'] 
                }
            }
        ];

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const currentHistory = [...chatHistory];
            if (userText) currentHistory.push({ role: 'user', parts: [{ text: userText }] });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: currentHistory,
                config: {
                    systemInstruction,
                    tools: [{ functionDeclarations: tools }],
                }
            });

            const responseContent = response.candidates?.[0]?.content;
            if (response.text) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text }]);
            }

            const functionCalls = responseContent?.parts?.filter(part => part.functionCall);
            if (functionCalls?.length) {
                for (const part of functionCalls) {
                    const call = part.functionCall;
                    const name = call?.name;
                    const args = call?.args as any;

                    if (name === 'show_services') setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', uiComponent: 'service-selector' }]);
                    else if (name === 'request_date_time') setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', uiComponent: 'date-time-picker' }]);
                    else if (name === 'request_location') setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', uiComponent: 'location-requester' }]);
                    else if (name === 'request_place_photos') setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', uiComponent: 'image-uploader', uiData: { type: 'place' } }]);
                    else if (name === 'request_payment') setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', uiComponent: 'payment-selector' }]);
                    else if (name === 'request_payment_proof') setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', uiComponent: 'image-uploader', uiData: { type: 'proof' } }]);
                    else if (name === 'finalize_booking') {
                        await executeFinalizeBooking(args);
                        const toolResponse = { functionResponse: { name: 'finalize_booking', response: { success: true } } };
                        const finalRes = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: [...currentHistory, responseContent!, { role: 'user', parts: [toolResponse] }],
                            config: { systemInstruction }
                        });
                    }
                }
            }

            if (responseContent) setChatHistory([...currentHistory, responseContent]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "حدث خطأ في الاتصال. حاول مرة أخرى.", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const buildWhatsAppMessage = (booking: Booking) => {
        let msg = `✅ **تم تأكيد الحجز بنجاح!**\n\n`;
        msg += `**🧾 فاتورة تفصيلية**\n`;
        msg += `------------------------\n`;
        msg += `**رقم الحجز:** #${booking.bookingId}\n`;
        msg += `**العميل:** ${booking.customerName}\n`;
        msg += `**الهاتف:** ${booking.phone}\n`;
        msg += `------------------------\n`;
        msg += `**تفاصيل الخدمات:**\n`;
        
        booking.services.forEach(service => {
            const unitLabel = service.type === 'meter' ? 'متر' : 'عدد';
            msg += `🔹 **${service.name_ar}**\n`;
            msg += `   الكمية: ${service.quantity} ${unitLabel} × ${service.price} ج = ${service.totalPrice.toLocaleString()} جنيه\n`;
        });
        
        msg += `------------------------\n`;
        msg += `**💰 الحساب النهائي:**\n`;
        msg += `**الإجمالي:** ${booking.basePrice.toLocaleString()} جنيه\n`;
        
        if (booking.paymentMethod === 'electronic') {
            const remainingBalance = booking.finalPrice - booking.advancePayment;
            msg += `**خصم الدفع الإلكتروني (10%):** -${booking.discountAmount.toLocaleString()} جنيه\n`;
            msg += `**الصافي للدفع:** ${booking.finalPrice.toLocaleString()} جنيه\n`;
            msg += `**قيمة العربون (25%):** ${booking.advancePayment.toLocaleString()} جنيه\n`;
            msg += `**المتبقي (عند الاستلام):** ${remainingBalance.toLocaleString()} جنيه\n`;
        } else {
            msg += `**المطلوب للدفع:** ${booking.finalPrice.toLocaleString()} جنيه\n`;
        }
        
        msg += `------------------------\n`;
        if (booking.address) msg += `📍 **العنوان:** ${booking.address}\n`;
        msg += `📅 **الموعد:** ${booking.date} | ${booking.time}\n`;
        
        if (booking.location) msg += `🗺️ **موقع GPS:** ${booking.location.url}\n`;
        
        // Ensure Payment Proof URL is included
        if (booking.paymentProof && booking.paymentProof.url) {
            msg += `🧾 **رابط إثبات الدفع:** ${booking.paymentProof.url}\n`;
        }
        
        return msg;
    };

    const executeFinalizeBooking = async (args: any) => {
        // Save phone to local storage for notifications
        if (args.phone) {
            localStorage.setItem('cleanmaster_user_phone', args.phone);
        }

        const finalData = { ...bookingContext, ...args };
        const selectedServices = finalData.services || [];
        
        if (selectedServices.length === 0) {
            appContext?.showMessage('لا توجد خدمات مختارة!', 'error');
            return;
        }

        const basePrice = selectedServices.reduce((acc: number, s: SelectedService) => acc + s.totalPrice, 0);
        let finalPrice = basePrice;
        let discountAmount = 0;
        let advancePayment = 0;

        if (finalData.paymentMethod === 'electronic') {
            discountAmount = basePrice * (appData.config.discount_percentage / 100);
            finalPrice = basePrice - discountAmount;
            advancePayment = finalPrice * 0.25; 
        }

        const bookingPayload: Partial<Booking> = {
            ...finalData,
            basePrice,
            finalPrice,
            discountAmount,
            advancePayment,
            services: selectedServices
        };

        try {
            const newBooking = await createBooking(bookingPayload);
            const whatsappMsgText = buildWhatsAppMessage(newBooking);
            const whatsappUrl = `https://wa.me/${appData.config.whatsapp_number}?text=${encodeURIComponent(whatsappMsgText)}`;
            
            // Build Invoice Text for Chat
            let invoiceText = `✅ **تم تأكيد الحجز بنجاح!**
            
**🧾 فاتورة تفصيلية**
------------------------
**رقم الحجز:** #${newBooking.bookingId}
**العميل:** ${newBooking.customerName}
------------------------
**تفاصيل الخدمات:**
`;
            selectedServices.forEach((service: SelectedService) => {
                 const unitLabel = service.type === 'meter' ? 'متر' : 'عدد';
                 invoiceText += `🔹 **${service.name_ar}**
   ${service.quantity} ${unitLabel} × ${service.price} ج = **${service.totalPrice.toLocaleString()} جنيه**\n`;
            });

            invoiceText += `------------------------
**💰 الحساب النهائي:**
**الإجمالي:** **${basePrice.toLocaleString()} جنيه**
`;

            if (finalData.paymentMethod === 'electronic') {
                const remainingBalance = finalPrice - advancePayment;
                invoiceText += `**خصم الدفع الإلكتروني (10%):** -${discountAmount.toLocaleString()} جنيه
**الصافي للدفع:** **${finalPrice.toLocaleString()} جنيه**
**قيمة العربون (25%):** **${advancePayment.toLocaleString()} جنيه**
**المتبقي (عند الاستلام):** **${remainingBalance.toLocaleString()} جنيه**`;
            } else {
                 invoiceText += `**المطلوب للدفع:** **${finalPrice.toLocaleString()} جنيه**`;
            }

            invoiceText += `
------------------------
${newBooking.address ? `📍 **العنوان:** ${newBooking.address}` : ''}
📅 **الموعد:** ${newBooking.date} | ${newBooking.time}

اضغط على الزر بالأسفل لإرسال الفاتورة وتأكيد الطلب عبر واتساب 👇`;

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: invoiceText,
                whatsappLink: whatsappUrl,
                isInvoice: true
            }]);
            appContext?.showMessage("تم الحجز بنجاح ✅", "success");
        } catch (e) {
            console.error(e);
            appContext?.showMessage("فشل الحفظ ❌", "error");
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;
        const text = inputText;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text }]);
        setInputText('');
        processAIInteraction(text);
    };

    // Sort services according to priority list
    const priorityOrder = ['mosque_carpets', 'home_cleaning_deep', 'home_cleaning_regular'];
    const sortedServices = [...services].sort((a, b) => {
        const indexA = priorityOrder.indexOf(a.id);
        const indexB = priorityOrder.indexOf(b.id);
        
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
    });

    const renderUIComponent = (msg: ChatMessage) => {
        if (!msg.uiComponent || msg.isInteracted) return null;

        switch (msg.uiComponent) {
            case 'service-selector':
                return (
                    <div className="grid grid-cols-2 gap-2 mt-2 w-full max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {sortedServices.map(s => (
                            <button key={s.id} onClick={() => handleServiceSelect(s.id)} className="bg-white border border-gray-200 p-2 rounded-lg text-xs hover:bg-[#21808D] hover:text-white transition-colors text-center shadow-sm flex flex-col items-center justify-center h-full">
                                <i className={`${s.icon} block mb-1 text-base`}></i>
                                {s.name_ar}
                            </button>
                        ))}
                    </div>
                );
            case 'quantity-input':
                return (
                    <div className="bg-white p-3 rounded-lg border border-gray-200 mt-2 shadow-sm w-full">
                        <label className="text-sm font-bold block mb-2 text-[#13343B]">
                             {msg.uiData?.label || 'أدخل الكمية أو المساحة:'} 📏
                        </label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                id="qty-input" 
                                min="1" 
                                defaultValue="1" 
                                className="flex-grow border rounded px-2 py-1 outline-none focus:border-[#21808D] bg-white text-gray-900 font-bold" 
                            />
                            <button 
                                onClick={() => {
                                    const val = (document.getElementById('qty-input') as HTMLInputElement).value;
                                    if(val) handleQuantitySubmit(parseInt(val));
                                }}
                                className="bg-[#21808D] text-white px-4 rounded text-sm"
                            >تأكيد ✅</button>
                        </div>
                    </div>
                );
            case 'cart-actions':
                const cartServices = bookingContext.services || [];
                const cartTotal = cartServices.reduce((acc, s) => acc + s.totalPrice, 0);

                return (
                    <div className="flex flex-col gap-2 mt-2 w-full">
                         <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                            <h4 className="font-bold text-[#13343B] mb-2 border-b pb-1">🛒 السلة الحالية:</h4>
                            {cartServices.length === 0 ? (
                                <p className="text-gray-500 text-xs">السلة فارغة</p>
                            ) : (
                                <ul className="space-y-2 mb-2">
                                    {cartServices.map((s, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                            <div>
                                                <span className="font-bold block text-xs">{s.name_ar}</span>
                                                <span className="text-[10px] text-gray-600">
                                                    {s.quantity} {s.type === 'meter' ? 'متر' : 'عدد'} × {s.price} ج
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[#21808D] text-xs">{s.totalPrice.toLocaleString()} ج</span>
                                                <button 
                                                    onClick={() => handleRemoveService(idx)}
                                                    className="w-5 h-5 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors cursor-pointer border border-red-200"
                                                    title="حذف الخدمة"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="flex justify-between font-bold border-t pt-2 text-[#21808D]">
                                <span>الإجمالي:</span>
                                <span>{cartTotal.toLocaleString()} جنيه</span>
                            </div>
                        </div>

                        <button onClick={handleActionAddService} className="bg-white border-2 border-[#21808D] text-[#21808D] p-3 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                            <i className="fas fa-plus-circle"></i> إضافة خدمة أخرى
                        </button>
                        
                        {cartServices.length > 0 && (
                            <button onClick={handleActionComplete} className="bg-[#21808D] text-white p-3 rounded-lg font-bold hover:bg-[#1D7480] transition-colors flex items-center justify-center gap-2 shadow-md">
                                <i className="fas fa-check-circle"></i> إكمال الحجز
                            </button>
                        )}
                    </div>
                );
            case 'date-time-picker':
                return (
                    <div className="bg-white p-3 rounded-lg border border-gray-200 mt-2 shadow-sm w-full">
                         <label className="text-xs font-bold block mb-1 text-[#13343B]">التاريخ 📅:</label>
                         <input type="date" id="chat-date" min={new Date().toISOString().split('T')[0]} className="w-full mb-2 border rounded p-1 text-sm bg-white text-gray-900" />
                         <label className="text-xs font-bold block mb-1 text-[#13343B]">الوقت ⏰:</label>
                         <select id="chat-time" className="w-full mb-3 border rounded p-1 text-sm bg-white text-gray-900">
                            {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => <option key={t} value={t}>{t}</option>)}
                         </select>
                         <button 
                            onClick={() => {
                                const d = (document.getElementById('chat-date') as HTMLInputElement).value;
                                const t = (document.getElementById('chat-time') as HTMLSelectElement).value;
                                if(d && t) handleDateTimeSelect(d, t);
                                else appContext?.showMessage('اختر التاريخ والوقت', 'error');
                            }}
                            className="w-full bg-[#21808D] text-white rounded p-1 text-sm"
                         >تأكيد الموعد ✅</button>
                    </div>
                );
            case 'payment-selector':
                return (
                    <div className="flex flex-col gap-2 mt-2 w-full">
                        <button onClick={() => handlePaymentSelect('cash')} className="bg-white border p-3 rounded-lg text-sm font-medium hover:bg-gray-50 flex justify-between items-center text-[#13343B]">
                            <span>💵 دفع نقدي (بعد الخدمة)</span>
                        </button>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <button onClick={() => handlePaymentSelect('electronic')} className="w-full bg-[#21808D] text-white p-2 rounded text-sm font-medium hover:bg-[#1D7480] flex justify-between items-center mb-2">
                                <span>💳 دفع إلكتروني (خصم 10%)</span>
                                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">توفير</span>
                            </button>
                            <div className="text-xs text-[#13343B] bg-white p-2 rounded border border-blue-100 relative">
                                <p className="font-bold mb-1">رقم التحويل (إنستا باي / محفظة):</p>
                                <div className="flex items-center justify-between bg-gray-100 p-1.5 rounded border border-gray-200">
                                    <span className="font-mono tracking-wider font-bold text-lg">{appData.company_info.payment_number}</span>
                                    <button onClick={() => copyToClipboard(appData.company_info.payment_number)} className="bg-white border border-gray-300 rounded px-2 py-0.5 text-[10px] hover:bg-gray-50 transition-colors flex items-center gap-1">
                                        <i className="fas fa-copy"></i> نسخ
                                    </button>
                                </div>
                                <p className="mt-1 text-gray-500 text-[10px] text-center">يرجى التحويل ثم رفع صورة الإيصال</p>
                            </div>
                        </div>
                    </div>
                );
             case 'location-requester':
                return (
                    <div className="mt-2 w-full space-y-2">
                        <button onClick={() => {
                            setIsLoading(true);
                            navigator.geolocation.getCurrentPosition(
                                (pos) => { 
                                    setIsLoading(false);
                                    handleLocationShared({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy, url: `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}` });
                                },
                                () => { setIsLoading(false); appContext?.showMessage('فشل تحديد الموقع', 'error'); }
                            );
                        }} className="bg-green-600 text-white w-full p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700">
                            <i className="fas fa-location-arrow"></i> مشاركة موقعي (GPS)
                        </button>
                        <button onClick={() => handleSkipStep('location')} className="bg-white border border-gray-300 text-gray-600 w-full p-2 rounded-lg hover:bg-gray-50 text-sm">
                             تخطي (كتابة العنوان يدوياً) ⏭️
                        </button>
                    </div>
                );
            case 'image-uploader':
                const isProof = msg.uiData?.type === 'proof';
                return (
                    <div className="mt-2 w-full space-y-2">
                        <div 
                            onClick={() => {
                                if (fileInputRef.current) {
                                    fileInputRef.current.setAttribute('data-is-proof', String(isProof));
                                    fileInputRef.current.value = '';
                                    fileInputRef.current.click();
                                }
                            }}
                            className="bg-white p-3 rounded-lg border border-dashed border-gray-300 text-center cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center"
                        >
                            <i className="fas fa-cloud-upload-alt text-2xl text-[#21808D] mb-2"></i>
                            <p className="text-xs text-gray-600">{isProof ? 'اضغط لرفع صورة إيصال التحويل' : 'اضغط لرفع صور المكان'}</p>
                        </div>
                        {!isProof && (
                             <button onClick={() => handleSkipStep('photos')} className="bg-white border border-gray-300 text-gray-600 w-full p-2 rounded-lg hover:bg-gray-50 text-sm">
                                لا توجد صور (تخطي) ⏭️
                            </button>
                        )}
                    </div>
                );
            default: return null;
        }
    };

    return (
        <>
            <button
                onClick={appContext?.toggleChatBot}
                className={`fixed bottom-6 left-6 z-[9990] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-[#5E5240] rotate-90' : 'bg-[#21808D] animate-bounce-slow'}`}
            >
                {isOpen ? <i className="fas fa-times text-white text-2xl"></i> : <i className="fas fa-robot text-white text-3xl"></i>}
            </button>

            <div className={`fixed bottom-24 left-6 z-[9990] w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-[#FCFCF9] rounded-2xl shadow-2xl border border-[#5E5240]/[0.1] flex flex-col transition-all duration-300 origin-bottom-left ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#21808D] to-[#266873] p-4 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
                            <i className="fas fa-robot"></i>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">مساعد كلين ماستر</h3>
                            <p className="text-white/80 text-xs flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full block"></span> متصل الآن
                            </p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="text-white/80 hover:text-white transition-colors p-2" title="بدء محادثة جديدة">
                        <i className="fas fa-sync-alt"></i>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#f4f4f4]">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}>
                             <div className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} w-full`}>
                                <div className={`max-w-[85%] ${!msg.text && msg.uiComponent ? 'w-full' : ''}`}>
                                    {msg.text && (
                                        <div className={`p-3 rounded-2xl shadow-sm whitespace-pre-wrap text-sm leading-relaxed mb-1 ${
                                            msg.role === 'user' 
                                                ? 'bg-[#21808D] text-white rounded-tr-none' 
                                                : msg.isInvoice 
                                                    ? 'bg-[#E0F7FA] text-[#006064] border border-[#26C6DA] rounded-tl-none font-medium' // Invoice Style
                                                    : 'bg-white text-[#13343B] rounded-tl-none border border-gray-200'
                                        } ${msg.isError ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                        >
                                        </div>
                                    )}
                                    {renderUIComponent(msg)}
                                </div>
                            </div>
                            {msg.whatsappLink && (
                                <a 
                                    href={msg.whatsappLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="mt-2 bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#20b85c] transition-colors shadow-sm animate-fadeIn self-end"
                                >
                                    <i className="fab fa-whatsapp text-lg"></i>
                                    تأكيد الحجز عبر واتساب
                                </a>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-end">
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex gap-1">
                                <span className="w-2 h-2 bg-[#21808D]/50 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-[#21808D]/50 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-[#21808D]/50 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 rounded-b-2xl">
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-[#21808D] focus-within:ring-1 focus-within:ring-[#21808D]/20 transition-all">
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="اكتب رسالتك هنا..." 
                            className="flex-grow bg-transparent border-none outline-none text-[#13343B] text-sm px-2"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit"
                            disabled={!inputText.trim() || isLoading}
                            className="w-10 h-10 bg-[#21808D] text-white rounded-lg flex items-center justify-center hover:bg-[#1D7480] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </form>
            </div>
            {/* Hidden global file input triggered by Ref */}
            <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                multiple
                onChange={(e) => {
                    const isProof = fileInputRef.current?.getAttribute('data-is-proof') === 'true';
                    handleFileInputChange(e, isProof);
                }}
            />
        </>
    );
};

export default ChatBot;
