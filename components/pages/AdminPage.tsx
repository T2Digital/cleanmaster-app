
import React, { useState, useEffect } from 'react';
// FINAL CORRECTED IMPORT PATH AND FUNCTION NAMES
import { getBookings, updateBookingStatus } from '../../api/bookingService';
import { Booking, BookingStatus } from '../../types';
import BookingDetailModal from '../BookingDetailModal';
import BookingCalendar from '../BookingCalendar';
import MessageContainer from '../MessageContainer';

const AdminPage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [view, setView] = useState<'list' | 'calendar'>('list');

    const loadBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            // Using the correct function name: getBookings
            const bookingsData = await getBookings();
            setBookings(bookingsData);
        } catch (err) {
            setError('فشل في تحميل الحجوزات. من فضلك حاول مرة أخرى.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
        setError(null);
        try {
            const updatedBooking = await updateBookingStatus(bookingId, status);
            setBookings(currentBookings =>
                currentBookings.map(b => b.bookingId === bookingId ? updatedBooking : b)
            );
            if (selectedBooking && selectedBooking.bookingId === bookingId) {
                setSelectedBooking(updatedBooking);
            }
        } catch (err) {
            setError('فشل في تحديث حالة الحجز. من فضلك حاول مرة أخرى.');
            console.error(err);
            throw err; // Re-throw to inform the modal
        }
    };

    const getStatusClass = (status: BookingStatus) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'in-progress': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-purple-100 text-purple-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getServiceNames = (booking: Booking): string => {
        if (booking.services && booking.services.length > 0) {
            return booking.services.map(s => s.name_ar).join(', ');
        }
        return "خدمة غير محددة";
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-[#FCFCF9]">
            <MessageContainer message={error} type="error" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#5E5240]">لوحة التحكم</h1>
                <div>
                    <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg mr-2 ${view === 'list' ? 'bg-[#21808D] text-white' : 'bg-gray-200'}`}>عرض القائمة</button>
                    <button onClick={() => setView('calendar')} className={`px-4 py-2 rounded-lg ${view === 'calendar' ? 'bg-[#21808D] text-white' : 'bg-gray-200'}`}>عرض التقويم</button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <p className="text-lg text-gray-500">جاري تحميل الحجوزات...</p>
                </div>
            ) : view === 'list' ? (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">العميل</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الخدمة</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">التاريخ والوقت</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الحالة</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.bookingId} onClick={() => setSelectedBooking(booking)} className="hover:bg-gray-50 cursor-pointer">
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{booking.customerName}</p>
                                            <p className="text-gray-600 whitespace-no-wrap">{booking.phone}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{getServiceNames(booking)}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{booking.date}</p>
                                            <p className="text-gray-600 whitespace-no-wrap">{booking.time}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${getStatusClass(booking.status)}`}>
                                                <span aria-hidden className="absolute inset-0 opacity-50 rounded-full"></span>
                                                <span className="relative">{booking.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap font-semibold">{booking.finalPrice.toLocaleString()} جنيه</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <BookingCalendar bookings={bookings} onBookingSelect={setSelectedBooking} />
            )}

            <BookingDetailModal
                booking={selectedBooking}
                onClose={() => setSelectedBooking(null)}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
};

export default AdminPage;
