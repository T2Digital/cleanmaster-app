
import React, { useState } from 'react';
import { Booking, BookingStatus } from '../../types';
import { AppContext } from '../../App';
import { getBookings } from '../../api/bookingService';
import LoadingSpinner from '../LoadingSpinner';

const OrdersPage: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState<Booking[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const appContext = React.useContext(AppContext);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^(01)[0-9]{9}$/.test(phone)) {
            appContext?.showMessage('يرجى إدخال رقم هاتف صحيح (01xxxxxxxxx)', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const customerBookings = await getBookings(phone);
            if (customerBookings.length === 0) {
                appContext?.showMessage('لا توجد طلبات مرتبطة بهذا الرقم', 'info');
                return;
            }
            
            const sortedOrders = customerBookings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setOrders(sortedOrders);
            setIsLoggedIn(true);
            appContext?.showMessage(`تم العثور على ${customerBookings.length} طلب`, 'success');
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            appContext?.showMessage('فشل في جلب الطلبات. حاول مرة أخرى.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getStatusInfo = (status: BookingStatus) => {
        const statusMap = {
          new: { text: 'طلب جديد', className: 'bg-blue-100 text-blue-800' },
          confirmed: { text: 'مؤكد', className: 'bg-yellow-100 text-yellow-800' },
          'in-progress': { text: 'قيد التنفيذ', className: 'bg-purple-100 text-purple-800' },
          completed: { text: 'مكتمل', className: 'bg-green-100 text-green-800' }
        };
        return statusMap[status] || { text: 'غير محدد', className: 'bg-gray-100 text-gray-800' };
    };

    return (
        <section className="bg-yellow-500/[0.08] pt-32 pb-20 min-h-screen">
            {isLoading && <LoadingSpinner />}
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4 text-[#13343B]">طلباتي</h2>
                    <p className="text-lg text-[#626C71] max-w-2xl mx-auto">تابع حالة طلباتك وتاريخ خدماتك</p>
                </div>

                {!isLoggedIn ? (
                    <div className="max-w-md mx-auto">
                        <div className="bg-[#FCFCF9] p-8 rounded-lg shadow-md border border-[#5E5240]/[0.12]">
                            <h3 className="text-xl font-semibold mb-6 text-center">سجل دخولك لمتابعة طلباتك</h3>
                            <form onSubmit={handleLogin}>
                                <div className="mb-4">
                                    <label className="block mb-2 font-medium text-sm">رقم الهاتف</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-2 border border-[#5E5240]/[0.2] rounded-lg bg-[#FCFCF9] focus:border-[#21808D] focus:ring-2 focus:ring-[#21808D]/50 outline-none"
                                        placeholder="01xxxxxxxxx"
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold bg-[#21808D] text-white transition-colors hover:bg-[#1D7480]">
                                    <i className="fas fa-sign-in-alt"></i>
                                    دخول
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.bookingId} className="bg-[#FCFCF9] p-6 rounded-lg shadow-md border border-[#5E5240]/[0.12]">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-[#5E5240]/[0.12]">
                                    <div>
                                        <span className="font-bold text-[#21808D]">طلب #{order.bookingId}</span>
                                        <span className="text-sm text-[#626C71] mr-4">{new Date(order.timestamp).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full mt-2 md:mt-0 ${getStatusInfo(order.status).className}`}>
                                        {getStatusInfo(order.status).text}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <strong className="block text-[#13343B]">الخدمات:</strong>
                                        <span className="text-[#626C71]">{order.services.map(s => s.name_ar).join('، ')}</span>
                                    </div>
                                    <div>
                                        <strong className="block text-[#13343B]">التاريخ المطلوب:</strong>
                                        <span className="text-[#626C71]">{order.date} - {order.time}</span>
                                    </div>
                                    <div>
                                        <strong className="block text-[#13343B]">طريقة الدفع:</strong>
                                        <span className="text-[#626C71]">{order.paymentMethod === 'cash' ? 'نقدي' : 'إلكتروني'}</span>
                                    </div>
                                    <div>
                                        <strong className="block text-[#13343B]">إجمالي التكلفة:</strong>
                                        <span className="text-[#626C71]">{order.finalPrice.toLocaleString()} جنيه</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default OrdersPage;