
import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, SelectedService } from '../types';
import { appData } from '../constants';

interface BookingDetailModalProps {
    booking: Booking | null;
    onClose: () => void;
    onStatusChange: (bookingId: string, status: BookingStatus) => Promise<void>;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, onClose, onStatusChange }) => {
    if (!booking) return null;

    const [status, setStatus] = useState(booking.status);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setStatus(booking.status);
    }, [booking]);

    const handleStatusChange = async () => {
        setIsUpdating(true);
        try {
            await onStatusChange(booking.bookingId, status);
            onClose(); 
        } catch (error) {
            // Parent component will show the error message
        } finally {
            setIsUpdating(false);
        }
    };

    // FLEXIBLE SERVICE DISPLAY - HANDLES BOTH `services` AND `service`
    let serviceDisplay = 'خدمة غير محددة';
    const servicesToDisplay: SelectedService[] = [];
    if (booking.services && booking.services.length > 0) {
        servicesToDisplay.push(...booking.services);
    } else if (booking.service) {
        servicesToDisplay.push(booking.service);
    }

    if (servicesToDisplay.length > 0) {
        serviceDisplay = servicesToDisplay.map(s => `${s.name_ar} (${s.type === 'meter' ? (s.quantity || 1) + ' متر' : (s.quantity || 1) + ' قطعة'})`).join(', ');
    }

    const paymentLink = booking.paymentMethod === 'electronic' && booking.finalPrice > 0
        ? `https://wa.me/${appData.company_info.whatsapp}?text=مرحباً، أود دفع مبلغ ${booking.finalPrice} جنيه لحجز رقم ${booking.bookingId}`
        : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-start pb-4 border-b">
                        <h3 className="text-2xl font-bold text-[#21808D]">تفاصيل الحجز #{booking.bookingId}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>

                    <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <DetailItem label="الاسم" value={booking.customerName} />
                        <DetailItem label="الهاتف" value={booking.phone} />
                        <DetailItem label="التاريخ" value={booking.date} />
                        <DetailItem label="الوقت" value={booking.time} />
                        <DetailItem label="التكلفة النهائية" value={`${booking.finalPrice.toLocaleString()} جنيه`} />
                        <DetailItem label="طريقة الدفع" value={booking.paymentMethod === 'cash' ? 'نقدي' : 'إلكتروني'} />
                        <div className="md:col-span-2">
                           <DetailItem label="العنوان" value={booking.address} />
                        </div>
                        <div className="md:col-span-2">
                           <DetailItem label="الخدمات" value={serviceDisplay} />
                        </div>

                        {booking.notes && (
                             <div className="md:col-span-2">
                                <DetailItem label="ملاحظات" value={booking.notes} />
                            </div>
                        )}

                        {paymentLink && (
                            <div className="md:col-span-2">
                                <strong className="font-semibold text-gray-700 block mb-1">رابط الدفع:</strong>
                                <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="text-[#21808D] font-semibold hover:underline">
                                    <i className="fab fa-whatsapp"></i> إرسال تذكير بالدفع عبر واتساب
                                </a>
                            </div>
                        )}
                        
                        {booking.photos && booking.photos.length > 0 && (
                            <div className="md:col-span-2">
                                <strong className="font-semibold text-gray-700 block mb-1">صور المكان:</strong>
                                <div className="flex gap-4 flex-wrap mt-1">
                                    {booking.photos.map((photo, index) => (
                                        <a key={index} href={photo.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#21808D] hover:underline">
                                           <img src={photo.thumb} alt={`Photo ${index+1}`} className="w-20 h-20 rounded-md object-cover border" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {booking.paymentProof && (
                           <div className="md:col-span-2">
                                <strong className="font-semibold text-gray-700 block mb-1">إثبات الدفع:</strong>
                                <a href={booking.paymentProof.url} target="_blank" rel="noopener noreferrer">
                                    <img src={booking.paymentProof.thumb} alt="Payment Proof" className="w-20 h-20 rounded-md object-cover border" />
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t flex flex-col sm:flex-row items-center gap-4">
                        <h4 className="font-semibold">تغيير حالة الحجز:</h4>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value as BookingStatus)}
                            className="flex-grow px-3 py-2 border border-[#5E5240]/[0.2] rounded-lg bg-[#FCFCF9] focus:border-[#21808D] focus:ring-1 focus:ring-[#21808D]/50 outline-none text-sm"
                        >
                            <option value="new">جديد</option>
                            <option value="confirmed">مؤكد</option>
                            <option value="in-progress">قيد التنفيذ</option>
                            <option value="completed">مكتمل</option>
                            <option value="cancelled">ملغى</option>
                        </select>
                        <button
                            onClick={handleStatusChange}
                            disabled={isUpdating || status === booking.status}
                            className="w-full sm:w-auto px-6 py-2 bg-[#21808D] text-white font-semibold rounded-lg hover:bg-[#1D7480] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'جاري الحفظ...' : 'حفظ التغيير'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{label: string, value: string | null | undefined}> = ({label, value}) => (
    <div>
        <strong className="font-semibold text-gray-700 block">{label}:</strong>
        <span className="text-gray-600">{value || ' - ' }</span>
    </div>
)

export default BookingDetailModal;
