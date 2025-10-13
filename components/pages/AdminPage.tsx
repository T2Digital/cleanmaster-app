import React, { useState, useEffect, useContext } from 'react';
import { appData } from '../../constants';
import { Booking, BookingStatus } from '../../types';
import { AppContext } from '../../App';
import { getBookings, updateBookingStatus as updateStatusService } from '../../api/bookingService';
import LoadingSpinner from '../LoadingSpinner';
import BookingCalendar from '../BookingCalendar';
import BookingDetailModal from '../BookingDetailModal';

const AdminPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const appContext = useContext(AppContext);

    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        if (isLoggedIn) {
            loadBookings();
        }
    }, [isLoggedIn]);

    const loadBookings = async () => {
        setIsLoading(true);
        try {
            // The server now guarantees full booking objects, so no more client-side checks needed.
            const allBookings = await getBookings();
            setBookings(allBookings);
        } catch (error) {
            appContext?.showMessage('فشل في تحميل الحجوزات', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === appData.admin_credentials.username && password === appData.admin_credentials.password) {
            setIsLoggedIn(true);
            appContext?.showMessage('تم تسجيل الدخول بنجاح', 'success');
        } else {
            appContext?.showMessage('بيانات الدخول غير صحيحة', 'error');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        appContext?.showMessage('تم تسجيل الخروج', 'info');
    };

    const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<void> => {
        try {
            const updatedBooking = await updateStatusService(bookingId, status);
            if (updatedBooking) {
                // The server returns the full updated booking object
                const newBookings = bookings.map(b => b.bookingId === bookingId ? updatedBooking : b);
                setBookings(newBookings);
                if (selectedBooking && selectedBooking.bookingId === bookingId) {
                    setSelectedBooking(updatedBooking);
                }
                appContext?.showMessage('تم تحديث حالة الحجز', 'success');
            }
        } catch (error) {
            appContext?.showMessage('فشل تحديث حالة الحجز', 'error');
            throw error; 
        }
    };
    
    if (!isLoggedIn) {
        return (
             <section className="bg-green-500/[0.08] pt-32 pb-20 min-h-screen flex items-center justify-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto">
                        <div className="bg-[#FCFCF9] p-8 rounded-lg shadow-md border border-[#5E5240]/[0.12]">
                            <h3 className="text-xl font-semibold mb-6 text-center">تسجيل دخول لوحة الإدارة</h3>
                            <form onSubmit={handleLogin}>
                                <div className="mb-4">
                                    <label className="block mb-2 font-medium text-sm">اسم المستخدم</label>
                                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2 border border-[#5E5240]/[0.2] rounded-lg bg-[#FCFCF9] focus:border-[#21808D] focus:ring-2 focus:ring-[#21808D]/50 outline-none" required />
                                </div>
                                <div className="mb-6">
                                    <label className="block mb-2 font-medium text-sm">كلمة المرور</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-[#5E5240]/[0.2] rounded-lg bg-[#FCFCF9] focus:border-[#21808D] focus:ring-2 focus:ring-[#21808D]/50 outline-none" required />
                                </div>
                                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold bg-[#21808D] text-white transition-colors hover:bg-[#1D7480]">
                                    <i className="fas fa-sign-in-alt"></i> دخول
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
    
    const tabs = [
        { id: 'overview', name: 'نظرة عامة' },
        { id: 'bookings', name: 'الحجوزات' },
        { id: 'calendar', name: 'التقويم' },
    ];
    
    // Filtering logic remains the same
    const filteredBookings = bookings
        .filter(booking => {
            if (filterStatus === 'all') return true;
            return booking.status === filterStatus;
        })
        .filter(booking => {
            if (!searchTerm.trim()) return true;
            const lowercasedTerm = searchTerm.toLowerCase();
            return (
                booking.customerName.toLowerCase().includes(lowercasedTerm) ||
                booking.phone.includes(lowercasedTerm) ||
                booking.bookingId.toLowerCase().includes(lowercasedTerm)
            );
        });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBookings = bookings.filter(b => new Date(b.timestamp) >= today).length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.finalPrice, 0);
    const newBookingsCount = bookings.filter(b => b.status === 'new').length;

    return (
        <section className="bg-green-500/[0.08] pt-32 pb-20 min-h-screen">
            {isLoading && <LoadingSpinner message="جاري تحميل البيانات..." />}
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b-2 border-[#21808D]">
                    <h2 className="text-3xl font-bold mb-4 md:mb-0">لوحة تحكم كلين ماستر</h2>
                    <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#5E5240]/[0.2] text-[#13343B] transition-colors hover:bg-[#5E5240]/[0.12]">
                        <i className="fas fa-sign-out-alt"></i> خروج
                    </button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-1 bg-[#FCFCF9] p-1 rounded-lg mb-8 shadow-sm">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-3 rounded-md text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-[#21808D] text-white' : 'text-[#626C71] hover:bg-[#5E5240]/[0.12]'}`}>
                            {tab.name}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                           <StatCard icon="fas fa-dollar-sign" value={`${totalRevenue.toLocaleString()} جنيه`} label="إجمالي الإيرادات" />
                           <StatCard icon="fas fa-receipt" value={totalBookings} label="إجمالي الحجوزات" />
                           <StatCard icon="fas fa-calendar-day" value={todayBookings} label="حجوزات اليوم" />
                           <StatCard icon="fas fa-bell" value={newBookingsCount} label="حجوزات جديدة" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">أحدث 5 حجوزات</h3>
                         <div className="space-y-4">
                            {bookings.slice(0, 5).map(b => <BookingCard key={b.bookingId} booking={b} onStatusChange={updateBookingStatus} onViewDetails={() => setSelectedBooking(b)} />)}
                        </div>
                    </div>
                )}
                
                 {activeTab === 'bookings' && (
                    <div>
                        <div className="bg-[#FCFCF9] p-4 rounded-lg shadow-sm border border-[#5E5240]/[0.12] mb-6 flex flex-col md:flex-row gap-4 items-center">
                             <div className="flex-grow w-full">
                                <input 
                                    type="text"
                                    placeholder="ابحث بالاسم, الهاتف, أو رقم الحجز..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-[#5E5240]/[0.2] rounded-lg bg-[#FCFCF9] focus:border-[#21808D] focus:ring-1 focus:ring-[#21808D]/50 outline-none"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap justify-center">
                                <FilterButton status="all" current={filterStatus} set={setFilterStatus}>الكل</FilterButton>
                                <FilterButton status="new" current={filterStatus} set={setFilterStatus}>جديد</FilterButton>
                                <FilterButton status="confirmed" current={filterStatus} set={setFilterStatus}>مؤكد</FilterButton>
                                <FilterButton status="in-progress" current={filterStatus} set={setFilterStatus}>قيد التنفيذ</FilterButton>
                                <FilterButton status="completed" current={filterStatus} set={setFilterStatus}>مكتمل</FilterButton>
                                <FilterButton status="cancelled" current={filterStatus} set={setFilterStatus}>ملغى</FilterButton>
                            </div>
                        </div>
                        <div className="space-y-4">
                             {filteredBookings.length > 0 ? (
                               filteredBookings.map(b => <BookingCard key={b.bookingId} booking={b} onStatusChange={updateBookingStatus} onViewDetails={() => setSelectedBooking(b)} />)
                            ) : (
                                <p className="text-center text-[#626C71] py-8">لا توجد حجوزات تطابق البحث.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'calendar' && (
                    // Calendar component now receives the full, guaranteed booking objects.
                    <BookingCalendar bookings={bookings} onStatusChange={updateBookingStatus} />
                )}
            </div>

            <BookingDetailModal 
                booking={selectedBooking} 
                onClose={() => setSelectedBooking(null)} 
                onStatusChange={updateBookingStatus}
            />
        </section>
    );
};

// --- Sub-components are now simplified as data integrity is guaranteed by the server --- 

const FilterButton: React.FC<{ status: BookingStatus | 'all', current: string, set: (s: any) => void, children: React.ReactNode }> = ({ status, current, set, children }) => {
    const isActive = status === current;
    return (
        <button 
            onClick={() => set(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-[#21808D] text-white' : 'bg-[#5E5240]/[0.12] text-[#13343B] hover:bg-[#5E5240]/[0.2]'}`}>
            {children}
        </button>
    );
};

const StatCard: React.FC<{ icon: string, value: string | number, label: string }> = ({ icon, value, label }) => (
    <div className="bg-[#FCFCF9] p-6 rounded-lg shadow-md border border-[#5E5240]/[0.12] flex items-center gap-4">
        <div className="w-16 h-16 flex-shrink-0 bg-blue-500/[0.08] rounded-lg flex items-center justify-center text-[#21808D] text-2xl">
            <i className={icon}></i>
        </div>
        <div>
            <h3 className="text-3xl font-bold text-[#21808D]">{value}</h3>
            <p className="text-[#626C71] text-sm">{label}</p>
        </div>
    </div>
);


const BookingCard: React.FC<{ booking: Booking, onStatusChange: (id: string, status: BookingStatus) => void, onViewDetails: () => void }> = ({ booking, onStatusChange, onViewDetails }) => {
    // The server guarantees the `services` array is present and formatted.
    const serviceDisplay = booking.services.map(s => `${s.name_ar} (${s.type === 'meter' ? s.quantity + 'متر' : s.quantity + ' قطعة'})`).join(', ') || 'خدمة غير محددة';
    
    const paymentLink = booking.paymentMethod === 'electronic' && booking.finalPrice > 0 
    ? `https://wa.me/${appData.company_info.whatsapp}?text=مرحباً، أود دفع مبلغ ${booking.finalPrice} جنيه لحجز رقم ${booking.bookingId}`
    : null;

    return (
        <div className="bg-[#FCFCF9] p-4 rounded-lg shadow-sm border border-[#5E5240]/[0.12]">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <strong className="text-[#21808D] cursor-pointer hover:underline" onClick={onViewDetails}>#{booking.bookingId} - {booking.customerName}</strong>
                    <span className="block text-xs text-gray-500">{new Date(booking.timestamp).toLocaleString('ar-EG')}</span>
                </div>
                <button onClick={onViewDetails} className="text-sm text-[#21808D] font-semibold hover:underline">عرض التفاصيل</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm mb-3">
                <span><strong><i className="fas fa-phone-alt fa-fw mr-1"></i></strong> {booking.phone}</span>
                <span><strong><i className="fas fa-calendar-alt fa-fw mr-1"></i></strong> {booking.date}</span>
                <span><strong><i className="fas fa-clock fa-fw mr-1"></i></strong> {booking.time}</span>
                <span><strong><i className="fas fa-money-bill-wave fa-fw mr-1"></i></strong> {booking.finalPrice.toLocaleString()} جنيه</span>
                <div className="col-span-full"><strong><i className="fas fa-map-marker-alt fa-fw mr-1"></i></strong> {booking.address}</div>
                <div className="col-span-full"><strong><i className="fas fa-concierge-bell fa-fw mr-1"></i></strong> {serviceDisplay}</div>
            </div>

            <div className="flex flex-wrap gap-4 items-center mt-3 pt-3 border-t border-gray-200">
                {/* Photos are now guaranteed to be an array (even if empty) */}
                {booking.photos && booking.photos.length > 0 && (
                    <div>
                        <span className="font-semibold text-xs text-gray-600">صور المكان:</span>
                        <div className="flex gap-2 flex-wrap mt-1">
                            {booking.photos.map((photo, index) => (
                                <a key={index} href={photo.url} target="_blank" rel="noopener noreferrer" title={`عرض الصورة ${index + 1}`}>
                                   <img src={photo.thumb} alt={`Photo ${index+1}`} className="w-10 h-10 rounded-md object-cover border-2 border-gray-300 hover:border-[#21808D]" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                {paymentLink && (
                     <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 font-semibold hover:underline">
                        <i className="fab fa-whatsapp"></i> رابط الدفع
                    </a>
                )}
            </div>

             <div className="mt-3 pt-3 border-t border-gray-200">
                 <select 
                    value={booking.status} 
                    onChange={e => onStatusChange(booking.bookingId, e.target.value as BookingStatus)}
                    className="w-full md:w-auto px-3 py-1.5 border border-[#5E5240]/[0.2] rounded-lg bg-[#FCFCF9] focus:border-[#21808D] focus:ring-1 focus:ring-[#21808D]/50 outline-none text-sm"
                >
                    <option value="new">جديد</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="in-progress">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغى</option>
                </select>
             </div>
        </div>
    );
}

export default AdminPage;
