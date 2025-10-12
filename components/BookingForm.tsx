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
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(image, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create a new File object with a consistent MIME type
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    } else {
                        reject(new Error('Canvas to Blob failed'));
                    }
                },
                'image/jpeg',
                0.8 // 80% quality
            );
        };
        // FIX: Replaced the 'onerror' handler to ensure it rejects with a proper Error object.
        // The original implementation could reject with an Event object, which may have caused
        // a confusing downstream type error.
        image.onerror = (_event, _source, _lineno, _colno, error) => {
            reject(error || new Error('Image could not be loaded.'));
        };
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

    const appContext = useContext(AppContext);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const paymentProofInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (preSelectedService) {
            setCurrentServiceId(preSelectedService.id);
        }
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
    }, [preSelectedService]);
    
    const currentService = appData.services.find(s => s.id === currentServiceId);

    const handleAddService = () => {
        if (!currentService) {
            appContext?.showMessage('يرجى اختيار خدمة', 'error');
            return;
        }
        if (selectedServices.some(s => s.id === currentServiceId)) {
            appContext?.showMessage('هذه الخدمة مضافة بالفعل', 'error');
            return;
        }

        let quantity = 0;
        if (currentService.type === 'meter') {
            quantity = parseInt(currentQuantity) || 0;
            if (quantity < appData.config.minimum_area) {
                appContext?.showMessage(`الحد الأدنى للمساحة هو ${appData.config.minimum_area} متر`, 'error');
                return;
            }
        } else if (currentService.type === 'fixed') {
             quantity = parseInt(currentQuantity) || 0;
             if (quantity < 1) {
                appContext?.showMessage('الحد الأدنى للعدد هو 1', 'error');
                return;
             }
        } else {
            quantity = 1;
        }

        const newService: SelectedService = {
            ...currentService,
            quantity,
            totalPrice: currentService.price * quantity,
        };
        setSelectedServices(prev => [...prev, newService]);
        setCurrentServiceId('');
        setCurrentQuantity('');
    };
    
    const handleRemoveService = (id: string) => {
        setSelectedServices(prev => prev.filter(s => s.id !== id));
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
            } else {
                console.error("ImgBB API Error:", result.error.message);
                appContext?.showMessage(`فشل رفع الصورة: ${file.name}`, 'error');
                return null;
            }
        } catch (error) {
            console.error("Upload Error:", error);
            appContext?.showMessage(`حدث خطأ أثناء رفع: ${file.name}`, 'error');
            return null;
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setLoadingMessage(`جاري رفع ${files.length} صورة...`);
            const uploadPromises = Array.from(files).map(file => uploadFile(file));
            try {
                const uploadedPhotos = await Promise.all(uploadPromises);
                const successfulUploads = uploadedPhotos.filter((p): p is Photo => p !== null);
                if (successfulUploads.length > 0) {
                   appContext?.showMessage(`تم رفع ${successfulUploads.length} صورة بنجاح`, 'success');
                   setPhotos(prev => [...prev, ...successfulUploads]);
                }
            } catch (error) {
                console.error("Error uploading photos in parallel", error);
                appContext?.showMessage('فشل رفع بعض الصور', 'error');
            } finally {
                setLoadingMessage(null);
            }
        }
    };

    const handlePaymentProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLoadingMessage('جاري رفع إثبات الدفع...');
            const uploadedProof = await uploadFile(file);
            if (uploadedProof) {
                appContext?.showMessage('تم رفع إثبات الدفع', 'success');
                setPaymentProof(uploadedProof);
            }
            setLoadingMessage(null);
        }
    };

    const handleLocationShare = () => {
        if (!navigator.geolocation) {
            appContext?.showMessage('المتصفح لا يدعم تحديد الموقع', 'error');
            return;
        }
        setLoadingMessage('جاري تحديد الموقع...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                setLocation({ latitude, longitude, accuracy, url: `https://maps.google.com/?q=${latitude},${longitude}` });
                appContext?.showMessage('تم تحديد الموقع بنجاح', 'success');
                setLoadingMessage(null);
            },
            () => {
                appContext?.showMessage('فشل تحديد الموقع', 'error');
                setLoadingMessage(null);
            }
        );
    };

    const buildWhatsAppMessage = (booking: Booking) => {
        let msg = `🌟 *حجز جديد - كلين ماستر* 🌟\n\n`;
        msg += `📋 *رقم الحجز:* ${booking.bookingId}\n`;
        msg += `👤 *الاسم:* ${booking.customerName}\n`;
        msg += `📱 *الهاتف:* ${booking.phone}\n`;
        msg += `📍 *العنوان:* ${booking.address}\n`;
        msg += `📅 *الموعد:* ${booking.date} - ${booking.time}\n\n`;
        msg += `🛠️ *الخدمات المطلوبة:*\n${booking.services.map(s => ` - ${s.name_ar} (${s.quantity})`).join('\n')}\n\n`;
        msg += `💰 *التكلفة الإجمالية:* ${booking.finalPrice.toLocaleString()} جنيه\n`;
        msg += `💳 *طريقة الدفع:* ${booking.paymentMethod === 'cash' ? 'نقدي' : 'إلكتروني'}\n`;
        if (booking.paymentMethod === 'electronic') {
            msg += `💵 *عربون مدفوع:* ${booking.advancePayment.toLocaleString()} جنيه\n`;
        }
        if (booking.notes) msg += `📝 *ملاحظات:* ${booking.notes}\n`;
        if (booking.location) msg += `🗺️ *الموقع:* ${booking.location.url}\n`;
        if (booking.photos.length > 0) msg += `📷 *صور المكان:* \n${booking.photos.map(p => p.url).join('\n')}\n`;
        if (booking.paymentProof) msg += `🧾 *إثبات الدفع:* ${booking.paymentProof.url}\n`;
        return msg;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validation
        if (selectedServices.length === 0) {
            appContext?.showMessage('اختر خدمة واحدة على الأقل', 'error'); return;
        }
        if (!customerName || !phone || !address || !date || !time) {
            appContext?.showMessage('يرجى ملء جميع الحقول المطلوبة (*)', 'error'); return;
        }
        if (paymentMethod === 'electronic' && !paymentProof) {
            appContext?.showMessage('يرجى رفع إثبات الدفع', 'error'); return;
        }
        
        setLoadingMessage('جاري إرسال الحجز...');
        const bookingData = {
            services: selectedServices,
            basePrice, finalPrice, discountAmount: discount, advancePayment,
            paymentMethod, customerName, phone, address, date, time, notes,
            location, photos, paymentProof,
        };
        
        try {
            const newBooking = await createBooking(bookingData);
            
            const message = buildWhatsAppMessage(newBooking);
            const whatsappUrl = `https://wa.me/${appData.config.whatsapp_number}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            
            appContext?.showMessage('تم إرسال حجزك بنجاح!', 'success');
            onClose();
        } catch (error) {
            console.error("Booking submission failed:", error);
            appContext?.showMessage('فشل حفظ الحجز. الرجاء المحاولة مرة أخرى.', 'error');
        } finally {
            setLoadingMessage(null);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {loadingMessage && <LoadingSpinner message={loadingMessage} />}
            <h2 className="text-2xl font-bold text-center">احجز خدمتك الآن</h2>
            
            {/* Service Selection */}
            <div className="p-4 bg-blue-500/[0.08] rounded-lg space-y-3">
                <h3 className="font-semibold text-[#21808D]"><i className="fas fa-list mr-2"></i>الخدمات المطلوبة</h3>
                {selectedServices.map(s => (
                    <div key={s.id} className="flex justify-between items-center bg-[#FCFCF9] p-2 rounded-md">
                        <span>{s.name_ar} ({s.quantity})</span>
                        <div className="flex items-center gap-2">
                           <span className="font-semibold text-[#21808D]">{s.totalPrice.toLocaleString()} جنيه</span>
                           <button type="button" onClick={() => handleRemoveService(s.id)} className="w-6 h-6 bg-red-500 text-white rounded-full text-xs">&times;</button>
                        </div>
                    </div>
                ))}
                 <div className="flex flex-col md:flex-row gap-2 items-end">
                    <div className="flex-grow w-full">
                        <label className="text-xs font-medium">اختر خدمة *</label>
                        <select value={currentServiceId} onChange={e => setCurrentServiceId(e.target.value)} className="w-full mt-1 px-3 py-2 border border-[#5E5240]/[0.2] rounded-lg bg-[#FCFCF9] outline-none">
                            <option value="">اختر...</option>
                            {appData.services.map(s => <option key={s.id} value={s.id}>{s.name_ar}</option>)}
                        </select>
                    </div>
                    {currentService && currentService.type !== 'consultation' && (
                        <div className="flex-grow w-full">
                            <label className="text-xs font-medium">{currentService.type === 'meter' ? 'المساحة (متر مربع) *' : 'العدد *'}</label>
                            <input type="number" value={currentQuantity} onChange={e => setCurrentQuantity(e.target.value)} min="1" className="w-full mt-1 px-3 py-2 border border-[#5E5240]/[0.2] rounded-lg bg-[#FCFCF9] outline-none" />
                        </div>
                    )}
                    <button type="button" onClick={handleAddService} className="w-full md:w-auto px-4 py-2 bg-[#5E5240]/[0.2] text-[#13343B] rounded-lg hover:bg-[#5E5240]/[0.3] transition-colors"><i className="fas fa-plus"></i> إضافة</button>
                </div>
            </div>

            {/* Payment Method & Summary */}
            <div className="p-4 rounded-lg space-y-3 border border-[#5E5240]/[0.12]">
                <h3 className="font-semibold text-[#21808D]"><i className="fas fa-credit-card mr-2"></i>طريقة الدفع</h3>
                <div className="flex gap-4">
                    <label className="flex-1 p-3 border-2 rounded-lg cursor-pointer transition-colors" style={{borderColor: paymentMethod === 'cash' ? '#21808D' : '#5E524033'}}>
                        <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="mr-2" />
                        دفع نقدي
                    </label>
                    <label className="flex-1 p-3 border-2 rounded-lg cursor-pointer transition-colors" style={{borderColor: paymentMethod === 'electronic' ? '#21808D' : '#5E524033'}}>
                        <input type="radio" name="paymentMethod" value="electronic" checked={paymentMethod === 'electronic'} onChange={() => setPaymentMethod('electronic')} className="mr-2" />
                        دفع إلكتروني (خصم 10%)
                    </label>
                </div>
                <div className="text-sm space-y-1 pt-2">
                    <div className="flex justify-between"><span>السعر الأساسي:</span> <span>{basePrice.toLocaleString()} جنيه</span></div>
                    {paymentMethod === 'electronic' && <div className="flex justify-between text-green-600"><span>خصم 10%:</span> <span>-{discount.toLocaleString()} جنيه</span></div>}
                    <div className="flex justify-between font-bold text-lg border-t pt-1 mt-1 border-[#21808D]"><span>الإجمالي:</span> <span>{finalPrice.toLocaleString()} جنيه</span></div>
                    {paymentMethod === 'electronic' && <div className="flex justify-between text-orange-600"><span>الجدية المطلوبة (25%):</span> <span>{advancePayment.toLocaleString()} جنيه</span></div>}
                </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>الاسم الكامل *</label><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-[#5E5240]/[0.2] rounded-lg" required /></div>
                <div><label>رقم الهاتف *</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full mt-1 px-3 py-2 border border-[#5E5240]/[0.2] rounded-lg" required /></div>
                <div className="md:col-span-2"><label>العنوان التفصيلي *</label><textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 border border-[#5E5240]/[0.2] rounded-lg" required></textarea></div>
            </div>

            {/* Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>التاريخ المطلوب *</label><input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full mt-1 px-3 py-2 border border-[#5E5240]/[0.2] rounded-lg" required /></div>
                <div><label>الوقت المفضل *</label>
                    <select value={time} onChange={e => setTime(e.target.value)} className="w-full mt-1 px-3 py-2 border border-[#5E5240]/[0.2] rounded-lg" required>
                         <option value="">اختر الوقت</option>
                         {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(t => (
                            <option key={t} value={t}>{t}</option>
                         ))}
                    </select>
                </div>
                <div className="md:col-span-2"><button type="button" onClick={handleLocationShare} className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${location ? 'border-green-500 text-green-600' : 'border-dashed'}`}><i className="fas fa-map-marker-alt mr-2"></i>{location ? 'تم تحديد الموقع' : 'مشاركة الموقع الحالي'}</button></div>
                <div className="md:col-span-2"><label>ملاحظات إضافية</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 border border-[#5E5240]/[0.2] rounded-lg"></textarea></div>
            </div>
            
             {/* File Uploads */}
            <div>
                 {paymentMethod === 'electronic' && (
                    <div className="mb-4">
                        <label className="font-semibold text-[#21808D]">إثبات الدفع *</label>
                        <div onClick={() => paymentProofInputRef.current?.click()} className="mt-1 p-4 border-2 border-dashed rounded-lg text-center cursor-pointer">
                            {paymentProof ? <img src={paymentProof.thumb} alt="proof" className="h-20 mx-auto" /> : "ارفع صورة إثبات الدفع"}
                        </div>
                        <input type="file" ref={paymentProofInputRef} onChange={handlePaymentProofUpload} accept="image/*" className="hidden" />
                    </div>
                )}
                <div>
                    <label className="font-semibold text-[#21808D]">صور المكان</label>
                     <div onClick={() => photoInputRef.current?.click()} className="mt-1 p-4 border-2 border-dashed rounded-lg text-center cursor-pointer">
                        اسحب الصور هنا أو انقر للاختيار
                    </div>
                    <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" multiple className="hidden" />
                    <div className="flex gap-2 mt-2 flex-wrap">{photos.map(p => <img key={p.thumb} src={p.thumb} className="h-16 w-16 object-cover rounded" />)}</div>
                </div>
            </div>


            <button type="submit" className="w-full py-3 bg-[#21808D] text-white font-bold rounded-lg hover:bg-[#1D7480] transition-colors"><i className="fas fa-check mr-2"></i>تأكيد الحجز وإرسال عبر الواتساب</button>
        </form>
    );
};

export default BookingForm;