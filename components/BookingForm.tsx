import React, { useState, useEffect, useContext, useRef } from 'react';
import { appData } from '../constants';
import { Service, SelectedService, Photo, Location, Booking } from '../types';
import { AppContext } from '../App';
import LoadingSpinner from './LoadingSpinner';
import { createBooking } from '../api/bookingService';

interface BookingFormProps {
    preSelectedService: Service | null;
    onClose: () => void;
}

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
            if (!ctx) return reject(new Error('Could not get canvas context'));
            ctx.drawImage(image, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                else reject(new Error('Canvas to Blob failed'));
            }, 'image/jpeg', 0.8);
        };
        image.onerror = (e) => reject(new Error('Image could not be loaded.'));
    });
};

const BookingForm: React.FC<BookingFormProps> = ({ preSelectedService, onClose }) => {
    const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
    const [currentServiceId, setCurrentServiceId] = useState('');
    const [currentQuantity, setCurrentQuantity] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'electronic'>('cash');
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [location, setLocation] = useState<Location | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [paymentProof, setPaymentProof] = useState<Photo | null>(null);

    const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);

    const appContext = useContext(AppContext);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const paymentProofInputRef = useRef<HTMLInputElement>(null);
    const services = appContext?.services || [];

    useEffect(() => {
        if (preSelectedService) setCurrentServiceId(preSelectedService.id);
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
    }, [preSelectedService]);
    
    const currentService = services.find(s => s.id === currentServiceId);

    const handleAddService = () => {
        if (!currentService) return appContext?.showMessage('يرجى اختيار خدمة', 'error');
        if (selectedServices.some(s => s.id === currentServiceId)) return appContext?.showMessage('هذه الخدمة مضافة بالفعل', 'error');

        let quantity = 0;
        if (currentService.type === 'meter') {
            quantity = parseInt(currentQuantity) || 0;
            if (quantity < appData.config.minimum_area) return appContext?.showMessage(`الحد الأدنى للمساحة هو ${appData.config.minimum_area} متر`, 'error');
        } else if (currentService.type === 'fixed') {
             quantity = parseInt(currentQuantity) || 0;
             if (quantity < 1) return appContext?.showMessage('الحد الأدنى للعدد هو 1', 'error');
        } else {
            quantity = 1;
        }

        const newService: SelectedService = { ...currentService, quantity, totalPrice: currentService.price * quantity };
        setSelectedServices(prev => [...prev, newService]);
        setCurrentServiceId('');
        setCurrentQuantity('');
    };
    
    const handleRemoveService = (id: string) => setSelectedServices(prev => prev.filter(s => s.id !== id));

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        appContext?.showMessage('تم نسخ الرقم بنجاح!', 'success');
    };
    
    const basePrice = selectedServices.reduce((acc, s) => acc + s.totalPrice, 0);
    const discount = paymentMethod === 'electronic' ? basePrice * (appData.config.discount_percentage / 100) : 0;
    const finalPrice = basePrice - discount;
    const advancePayment = paymentMethod === 'electronic' ? finalPrice * (appData.config.advance_payment_percentage / 100) : 0;

    const uploadFile = async (file: File): Promise<Photo | null> => {
       try {
            const compressedFile = await compressImage(file);
            const formData = new FormData();
            formData.append('image', compressedFile);
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${appData.config.imgbb_api_key}`, {
                method: 'POST', body: formData
            });
            const result = await response.json();
            if (result.success) return { url: result.data.url, thumb: result.data.thumb.url, title: result.data.title, delete_url: result.data.delete_url };
            appContext?.showMessage(`فشل رفع الصورة: ${file.name}`, 'error'); return null;
        } catch (error) {
            appContext?.showMessage(`خطأ في الرفع: ${file.name}`, 'error'); return null;
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setLoadingMessage(`جاري رفع ${files.length} صورة...`);
            // Fix: Explicitly cast Array.from(files) to File[] to avoid 'unknown' type error in map
            const uploadPromises = (Array.from(files) as File[]).map(file => uploadFile(file));
            try {
                const results = await Promise.all(uploadPromises);
                const successful = results.filter((p): p is Photo => p !== null);
                if (successful.length > 0) {
                   appContext?.showMessage(`تم رفع ${successful.length} صورة`, 'success');
                   setPhotos(prev => [...prev, ...successful]);
                }
            } finally { setLoadingMessage(null); }
        }
    };

    const handlePaymentProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLoadingMessage('جاري رفع إثبات الدفع...');
            const uploadedProof = await uploadFile(file);
            if (uploadedProof) {
                appContext?.showMessage('تم رفع الإثبات بنجاح', 'success');
                setPaymentProof(uploadedProof);
            }
            setLoadingMessage(null);
        }
    };

    const handleLocationShare = () => {
        if (!navigator.geolocation) return appContext?.showMessage('المتصفح لا يدعم الموقع', 'error');
        setLoadingMessage('جاري تحديد موقعك...');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                setLocation({ latitude, longitude, accuracy, url: `https://maps.google.com/?q=${latitude},${longitude}` });
                appContext?.showMessage('تم تحديد الموقع GPS', 'success');
                setLoadingMessage(null);
            },
            () => { appContext?.showMessage('فشل تحديد الموقع', 'error'); setLoadingMessage(null); }
        );
    };

    const buildWhatsAppInvoice = (booking: Booking) => {
        let msg = `✅ *تم تأكيد الحجز بنجاح!* - (عبر الموقع)\n\n`;
        msg += `🧾 *فاتورة حجز تفصيلية*\n`;
        msg += `------------------------\n`;
        msg += `*رقم الحجز:* #${booking.bookingId}\n`;
        msg += `*العميل:* ${booking.customerName}\n`;
        msg += `*الهاتف:* ${booking.phone}\n`;
        msg += `------------------------\n`;
        msg += `*الخدمات المطلوبة:*\n`;

        booking.services.forEach(s => {
            const unit = s.type === 'meter' ? 'متر' : 'قطعة';
            msg += `🔹 *${s.name_ar}*\n`;
            msg += `   الكمية: ${s.quantity} ${unit} × ${s.price} ج = ${s.totalPrice.toLocaleString()} جنيه\n`;
        });
        
        msg += `------------------------\n`;
        msg += `💰 *الملخص المالي:*\n`;
        msg += `*الإجمالي:* ${booking.basePrice.toLocaleString()} جنيه\n`;
        
        if (booking.paymentMethod === 'electronic') {
            const remaining = booking.finalPrice - booking.advancePayment;
            msg += `*خصم الدفع الإلكتروني (10%):* -${booking.discountAmount.toLocaleString()} جنيه\n`;
            msg += `*الصافي بعد الخصم:* ${booking.finalPrice.toLocaleString()} جنيه\n`;
            msg += `*العربون المحول (25%):* ${booking.advancePayment.toLocaleString()} جنيه\n`;
            msg += `*المتبقي (عند الاستلام):* ${remaining.toLocaleString()} جنيه\n`;
        } else {
            msg += `*المطلوب عند الاستلام:* ${booking.finalPrice.toLocaleString()} جنيه\n`;
        }

        msg += `------------------------\n`;
        msg += `📍 *العنوان:* ${booking.address}\n`;
        msg += `📅 *الموعد:* ${booking.date} | الساعة ${booking.time}\n`;
        if (booking.notes) msg += `📝 *ملاحظات:* ${booking.notes}\n`;
        if (booking.location) msg += `🗺️ *الموقع (GPS):* ${booking.location.url}\n`;
        if (booking.paymentProof) msg += `🧾 *إثبات الدفع:* ${booking.paymentProof.url}\n`;
        
        return msg;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedServices.length === 0) return appContext?.showMessage('اختر خدمة واحدة على الأقل', 'error');
        if (!customerName || !phone || !address || !date || !time) return appContext?.showMessage('أكمل البيانات المطلوبة (*)', 'error');
        if (paymentMethod === 'electronic' && !paymentProof) return appContext?.showMessage('ارفع إثبات الدفع أولاً', 'error');
        
        setLoadingMessage('جاري تسجيل حجزك...');
        if (phone) localStorage.setItem('cleanmaster_user_phone', phone);

        const bookingData = {
            services: selectedServices, basePrice, finalPrice, discountAmount: discount, advancePayment,
            paymentMethod, customerName, phone, address, date, time, notes, location, photos, paymentProof,
        };
        
        try {
            const newBooking = await createBooking(bookingData);
            setSubmittedBooking(newBooking);
            appContext?.showMessage('تم الحجز بنجاح ✅', 'success');
        } catch (error) {
            appContext?.showMessage('حدث خطأ أثناء الحفظ', 'error');
        } finally { setLoadingMessage(null); }
    };

    if (submittedBooking) {
        const whatsappMsg = buildWhatsAppInvoice(submittedBooking);
        const whatsappUrl = `https://wa.me/${appData.config.whatsapp_number}?text=${encodeURIComponent(whatsappMsg)}`;
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-fadeInUp">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-white">
                    <i className="fas fa-check text-4xl text-green-600"></i>
                </div>
                <h2 className="text-3xl font-black text-[#13343B] mb-2">طلبك قيد التأكيد! 🎉</h2>
                <p className="text-[#626C71] mb-8 max-w-sm">رقم الفاتورة: <span className="font-bold text-[#21808D]">#{submittedBooking.bookingId}</span><br/>اضغط على الزر بالأسفل لإرسال الفاتورة عبر واتساب وتأكيد الموعد نهائياً.</p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-[#20b85c] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 text-xl">
                    <i className="fab fa-whatsapp text-2xl"></i> إرسال الفاتورة عبر واتساب
                </a>
                <button onClick={onClose} className="mt-6 text-gray-500 hover:text-[#21808D] text-sm underline font-medium">العودة للرئيسية</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {loadingMessage && <LoadingSpinner message={loadingMessage} />}
            <div className="text-center">
                <h2 className="text-3xl font-black text-[#13343B]">نموذج الحجز السريع</h2>
                <div className="w-16 h-1 bg-[#21808D] mx-auto mt-2 rounded-full"></div>
            </div>
            
            <div className="p-5 bg-[#F0F9FA] rounded-2xl border border-[#B2EBF2] space-y-4">
                <h3 className="font-bold text-[#13343B] flex items-center gap-2"><i className="fas fa-shopping-basket text-[#21808D]"></i> الخدمات المختارة</h3>
                {selectedServices.map(s => (
                    <div key={s.id} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm">
                            <span className="font-bold block">{s.name_ar}</span>
                            <span className="text-gray-500">{s.quantity} {s.type === 'meter' ? 'متر' : 'قطعة'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="font-bold text-[#21808D]">{s.totalPrice.toLocaleString()} ج</span>
                           <button type="button" onClick={() => handleRemoveService(s.id)} className="w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">&times;</button>
                        </div>
                    </div>
                ))}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-gray-600 mb-1 block">اختر خدمة *</label>
                        <select value={currentServiceId} onChange={e => setCurrentServiceId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:border-[#21808D]">
                            <option value="">اختر من القائمة...</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.name_ar}</option>)}
                        </select>
                    </div>
                    {currentService && currentService.type !== 'consultation' && (
                        <div className="md:col-span-1">
                            <label className="text-xs font-bold text-gray-600 mb-1 block">{currentService.type === 'meter' ? 'المساحة (م²)' : 'العدد'}</label>
                            <input type="number" value={currentQuantity} onChange={e => setCurrentQuantity(e.target.value)} min="1" className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none" />
                        </div>
                    )}
                    <button type="button" onClick={handleAddService} className="bg-[#21808D] text-white py-2 rounded-xl font-bold hover:bg-[#1D7480] transition-all shadow-md"><i className="fas fa-plus"></i> إضافة</button>
                </div>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-4">
                <h3 className="font-bold text-[#13343B] flex items-center gap-2"><i className="fas fa-wallet text-[#21808D]"></i> طريقة الدفع والتكلفة</h3>
                <div className="flex gap-4">
                    <label className={`flex-1 p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center gap-2 ${paymentMethod === 'cash' ? 'border-[#21808D] bg-[#F0F9FA]' : 'border-gray-100'}`}>
                        <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="hidden" />
                        <i className="fas fa-money-bill-wave text-xl"></i>
                        <span className="font-bold text-sm">دفع نقدي</span>
                    </label>
                    <label className={`flex-1 p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center gap-2 ${paymentMethod === 'electronic' ? 'border-[#21808D] bg-[#F0F9FA]' : 'border-gray-100'}`}>
                        <input type="radio" name="paymentMethod" value="electronic" checked={paymentMethod === 'electronic'} onChange={() => setPaymentMethod('electronic')} className="hidden" />
                        <i className="fas fa-credit-card text-xl"></i>
                        <span className="font-bold text-sm">إلكتروني (-10%)</span>
                    </label>
                </div>
                
                {paymentMethod === 'electronic' && (
                     <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                        <p className="text-xs font-bold text-gray-500 mb-2 text-center">رقم التحويل (إنستا باي / محفظة):</p>
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                            <span className="font-mono text-xl font-black tracking-widest text-[#21808D]">{appData.company_info.payment_number}</span>
                            <button type="button" onClick={() => copyToClipboard(appData.company_info.payment_number)} className="bg-[#21808D] text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">نسخ</button>
                        </div>
                    </div>
                )}

                <div className="space-y-2 pt-2 border-t border-gray-50">
                    <div className="flex justify-between text-sm"><span>إجمالي الخدمات:</span> <span>{basePrice.toLocaleString()} ج</span></div>
                    {paymentMethod === 'electronic' && <div className="flex justify-between text-green-600 text-sm font-bold"><span>خصم الحجز الإلكتروني:</span> <span>-{discount.toLocaleString()} ج</span></div>}
                    <div className="flex justify-between font-black text-xl text-[#21808D] pt-2"><span>الصافي النهائي:</span> <span>{finalPrice.toLocaleString()} جنيه</span></div>
                    {paymentMethod === 'electronic' && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-xl text-xs space-y-1">
                            <div className="flex justify-between text-orange-700 font-bold"><span>العربون المطلوب (25%):</span> <span>{advancePayment.toLocaleString()} ج</span></div>
                            <div className="flex justify-between text-gray-500"><span>المتبقي عند التنفيذ:</span> <span>{(finalPrice - advancePayment).toLocaleString()} ج</span></div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1"><label className="text-xs font-bold text-gray-600">الاسم الكامل *</label><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#21808D] outline-none" required /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-600">رقم الهاتف *</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#21808D] outline-none" required /></div>
                <div className="md:col-span-2 space-y-1"><label className="text-xs font-bold text-gray-600">العنوان التفصيلي (شارع، عمارة، شقة) *</label><textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#21808D] outline-none" required></textarea></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1"><label className="text-xs font-bold text-gray-600">تاريخ الزيارة *</label><input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" required /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-600">موعد الزيارة المفضل *</label>
                    <select value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" required>
                         <option value="">اختر الوقت...</option>
                         {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2"><button type="button" onClick={handleLocationShare} className={`w-full py-3 border-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${location ? 'border-green-500 text-green-600 bg-green-50' : 'border-dashed border-gray-300 text-gray-400'}`}><i className="fas fa-map-marker-alt"></i>{location ? 'تم حفظ موقعك GPS ✅' : 'إرسال موقعك GPS (اختياري)'}</button></div>
            </div>
            
            <div className="space-y-4">
                 {paymentMethod === 'electronic' && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[#21808D]">إثبات الدفع (لقطة شاشة للتحويل) *</label>
                        <div onClick={() => paymentProofInputRef.current?.click()} className="p-5 border-2 border-dashed border-[#21808D]/30 rounded-2xl text-center cursor-pointer hover:bg-[#F0F9FA] transition-all">
                            {paymentProof ? <div className="flex items-center justify-center gap-2"><img src={paymentProof.thumb} className="w-12 h-12 rounded object-cover" /> <span className="text-xs font-bold">تم الرفع ✅</span></div> : <><i className="fas fa-receipt text-2xl text-gray-300 mb-1"></i><p className="text-xs text-gray-500">انقر لرفع صورة الإيصال</p></>}
                        </div>
                        <input type="file" ref={paymentProofInputRef} onChange={handlePaymentProofUpload} accept="image/*" className="hidden" />
                    </div>
                )}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">صور للمكان (اختياري)</label>
                     <div onClick={() => photoInputRef.current?.click()} className="p-4 border-2 border-dashed border-gray-200 rounded-2xl text-center cursor-pointer hover:bg-gray-50">
                        <i className="fas fa-camera text-gray-300 text-xl mb-1"></i><p className="text-xs text-gray-400">انقر لاختيار صور</p>
                    </div>
                    <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" multiple className="hidden" />
                    <div className="flex gap-2 mt-2 flex-wrap">{photos.map((p, i) => <img key={i} src={p.thumb} className="w-12 h-12 object-cover rounded-lg shadow-sm" />)}</div>
                </div>
            </div>

            <button type="submit" className="w-full py-5 bg-[#21808D] text-white font-black text-xl rounded-2xl hover:bg-[#1D7480] transition-all shadow-xl transform active:scale-95"><i className="fas fa-check-double mr-2"></i>تأكيد الحجز الآن</button>
        </form>
    );
};

export default BookingForm;