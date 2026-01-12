import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { appData } from '../../constants';
import { Booking, BookingStatus } from '../../types';
import { AppContext } from '../../App';
import { updateBookingStatus as updateStatusService } from '../../api/bookingService';
import LoadingSpinner from '../LoadingSpinner';
import BookingCalendar from '../admin/BookingCalendar';
import BookingDetailModal from '../admin/BookingDetailModal';
import ServicesManager from '../admin/ServicesManager';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const AdminPage: React.FC = () => {
    const appContext = useContext(AppContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        if (!appContext?.isAdminLoggedIn) return;

        setIsLoading(true);
        const q = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedBookings: Booking[] = [];
            snapshot.forEach((doc) => {
                fetchedBookings.push({ ...doc.data() } as Booking);
            });
            
            setBookings(fetchedBookings);
            setIsLoading(false);
            // Notification logic is handled globally in App.tsx now
        }, (error) => {
            console.error("Firestore listener error:", error);
            appContext?.showMessage('فشل الاتصال المباشر بقاعدة البيانات', 'error');
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [appContext?.isAdminLoggedIn, appContext]);
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === appData.admin_credentials.username && password === appData.admin_credentials.password) {
            appContext?.loginAdmin();
            appContext?.showMessage('تم تسجيل الدخول بنجاح', 'success');
        } else {
            appContext?.showMessage('بيانات الدخول غير صحيحة', 'error');
        }
    };

    const handleLogout = () => {
        appContext?.logoutAdmin();
        setUsername('');
        setPassword('');
        appContext?.showMessage('تم تسجيل الخروج', 'info');
    };

    const updateBookingStatus = useCallback(async (bookingId: string, status: BookingStatus) => {
        try {
            const updatedBooking = await updateStatusService(bookingId, status);
            if (updatedBooking) {
                appContext?.showMessage('تم تحديث حالة الحجز', 'success');
            }
        } catch (error) {
            appContext?.showMessage('فشل تحديث حالة الحجز', 'error');
        }
    }, [appContext]);

    const handleCalendarEventClick = useCallback((booking: Booking) => {
        setSelectedBooking(booking);
    }, []);
    
    if (!appContext?.isAdminLoggedIn) {
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
        { id: 'services', name: 'الخدمات' },
    ];
    
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

    const todayString = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === todayString && b.status !== 'cancelled').length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.finalPrice, 0);
    const newBookingsCount = bookings.filter(b => b.status === 'new').length;

    return (
        <>
            <section className="bg-green-500/[0.08] pt-32 pb-20 min-h-screen">
                {isLoading && <LoadingSpinner message="جاري مزامنة البيانات..." />}
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b-2 border-[#21808D]">
                        <div className="flex items-center gap-3 mb-4 md:mb-0">
                             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                             <h2 className="text-3xl font-bold">لوحة التحكم</h2>
                        </div>
                        <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#5E5240]/[0.2] text-[#13343B] transition-colors hover:bg-[#5E5240]/[0.12]">
                            <i className="fas fa-sign-out-alt"></i> خروج
                        </button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-1 bg-[#FCFCF9] p-1 rounded-lg mb-8 shadow-sm overflow-x-auto">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] px-4 py-3 rounded-md text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-[#21808D] text-white' : 'text-[#626C71] hover:bg-[#5E5240]/[0.12]'}`}>
                                {tab.name}
                            </button>
                        ))}
                    </div>

                    <div>
                        {activeTab === 'overview' && (
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard icon="fas fa-dollar-sign" value={`${totalRevenue.toLocaleString()} جنيه`} label="الإيرادات (المكتملة)" />
                                <StatCard icon="fas fa-receipt" value={totalBookings} label="إجمالي الحجوزات" />
                                <StatCard icon="fas fa-calendar-day" value={todayBookings} label="حجوزات اليوم (المجدولة)" />
                                <StatCard icon="fas fa-bell" value={newBookingsCount} label="حجوزات جديدة" highlight />
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
                            <BookingCalendar
                                bookings={bookings}
                                onEventClick={handleCalendarEventClick}
                            />
                        )}

                        {activeTab === 'services' && (
                            <ServicesManager />
                        )}
                    </div>
                </div>
            </section>
            <BookingDetailModal
                key={selectedBooking?.bookingId || 'none'}
                booking={selectedBooking}
                onClose={() => setSelectedBooking(null)}
                onStatusChange={updateBookingStatus}
            />
        </>
    );
};

const FilterButton: React.FC<{ status: BookingStatus | 'all', current: string, set: (s: any) => void, children: React.ReactNode }> = ({ status, current, set, children }) => {
    const isActive = status === current;
    return (
        <button 
            onClick={() => set(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-[#21808D] text-white' : 'bg-[#5E5240]/[0.12] text-[#13343B] hover:bg-[#5E5240]/[0.2]'}`}
        >
            {children}
        </button>
    );
};

const StatCard: React.FC<{ icon: string, value: string | number, label: string, highlight?: boolean }> = ({ icon, value, label, highlight }) => (
    <div className={`bg-[#FCFCF9] p-6 rounded-lg shadow-md border flex items-center gap-4 ${highlight ? 'border-[#21808D] bg-blue-50' : 'border-[#5E5240]/[0.12]'}`}>
        <div className={`w-16 h-16 flex-shrink-0 rounded-lg flex items-center justify-center text-2xl ${highlight ? 'bg-[#21808D] text-white' : 'bg-blue-500/[0.08] text-[#21808D]'}`}>
            <i className={`${icon} ${highlight ? 'animate-swing' : ''}`}></i>
        </div>
        <div>
            <h3 className="text-3xl font-bold text-[#21808D]">{value}</h3>
            <p className="text-[#626C71] text-sm">{label}</p>
        </div>
    </div>
);


const BookingCard: React.FC<{ booking: Booking, onStatusChange: (id: string, status: BookingStatus) => void, onViewDetails: () => void }> = ({ booking, onStatusChange, onViewDetails }) => {
    const servicesList = (booking.services && booking.services.length > 0)
        ? booking.services.map(s => `${s.name_ar} (${s.type === 'meter' ? (s.quantity || 1) + 'متر' : (s.quantity || 1) + ' قطعة'})`).join('، ')
        : 'لا توجد خدمات';
    
    return (
        <div className={`bg-[#FCFCF9] p-4 rounded-lg shadow-sm border ${booking.status === 'new' ? 'border-[#21808D] ring-1 ring-[#21808D]/20' : 'border-[#5E5240]/[0.12]'}`}>
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <strong className="text-[#21808D]">#{booking.bookingId} - {booking.customerName}</strong>
                    {booking.status === 'new' && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">جديد</span>}
                    {booking.photos && booking.photos.length > 0 && (
                        <span className="text-[#626C71] text-sm" title={`${booking.photos.length} صور مرفقة`}>
                            <i className="fas fa-camera"></i> {booking.photos.length}
                        </span>
                    )}
                </div>
                <span className="text-xs text-[#626C71]">{new Date(booking.timestamp).toLocaleString('ar-EG')}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                <span><strong>الهاتف:</strong> {booking.phone}</span>
                <span><strong>التاريخ:</strong> {booking.date}</span>
                <span><strong>الوقت:</strong> {booking.time}</span>
                <span><strong>التكلفة:</strong> {booking.finalPrice.toLocaleString()} جنيه</span>
                <span className="col-span-full"><strong>العنوان:</strong> {booking.address}</span>
                <span className="col-span-full"><strong>الخدمات:</strong> {servicesList}</span>
            </div>
            <div className="flex flex-col md:flex-row gap-2 items-center mt-3">
                <select 
                    value={booking.status} 
                    onChange={e => onStatusChange(booking.bookingId, e.target.value as BookingStatus)}
                    className="w-full md:w-auto flex-grow px-3 py-1.5 border border-[#5E5240]/[0.2] rounded-lg bg-[#FCFCF9] focus:border-[#21808D] focus:ring-1 focus:ring-[#21808D]/50 outline-none text-sm"
                >
                    <option value="new">جديد</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="in-progress">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغى</option>
                </select>
                <button 
                    onClick={onViewDetails}
                    className="w-full md:w-auto px-4 py-1.5 text-sm bg-[#5E5240]/[0.12] text-[#13343B] rounded-lg hover:bg-[#5E5240]/[0.2] transition-colors"
                >
                    عرض التفاصيل
                </button>
            </div>
        </div>
    );
}

export default AdminPage;