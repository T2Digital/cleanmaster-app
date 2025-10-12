import React, { useState, useEffect, useContext } from 'react';
import { appData } from '../../constants';
import { Booking, BookingStatus } from '../../types';
import { AppContext } from '../../App';
import { getBookings, updateBookingStatus as updateStatusService } from '../../api/bookingService';
import LoadingSpinner from '../LoadingSpinner';

const AdminPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const appContext = useContext(AppContext);

    // New states for filtering and searching
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');


    useEffect(() => {
        if (isLoggedIn) {
            loadBookings();
        }
    }, [isLoggedIn]);

    const loadBookings = async () => {
        setIsLoading(true);
        try {
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

    const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
        try {
            const updatedBooking = await updateStatusService(bookingId, status);
            if (updatedBooking) {
                setBookings(bookings.map(b => b.bookingId === bookingId ? updatedBooking : b));
                appContext?.showMessage('تم تحديث حالة الحجز', 'success');
            }
        } catch (error) {
            appContext?.showMessage('فشل تحديث حالة الحجز', 'error');
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
    ];
    
    // Derived state for filtered bookings
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
                            {bookings.slice(0, 5).map(b => <BookingCard key={b.bookingId} booking={b} onStatusChange={updateBookingStatus} />)}
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
                            </div>
                        </div>
                        <div className="space-y-4">
                             {filteredBookings.length > 0 ? (
                               filteredBookings.map(b => <BookingCard key={b.bookingId} booking={b} onStatusChange={updateBookingStatus} />)
                            ) : (
                                <p className="text-center text-[#626C71] py-8">لا توجد حجوزات تطابق البحث.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
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


const BookingCard: React.FC<{ booking: Booking, onStatusChange: (id: string, status: BookingStatus) => void }> = ({ booking, onStatusChange }) => {
    const servicesList = booking.services.map(s => `${s.name_ar} (${s.type === 'meter' ? s.quantity + 'متر' : s.quantity + ' قطعة'})`).join('، ');
    
    return (
        <div className="bg-[#FCFCF9] p-4 rounded-lg shadow-sm border border-[#5E5240]/[0.12]">
            <div className="flex justify-between items-center mb-3">
                <strong className="text-[#21808D]">#{booking.bookingId} - {booking.customerName}</strong>
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
             <select 
                value={booking.status} 
                onChange={e => onStatusChange(booking.bookingId, e.target.value as BookingStatus)}
                className="w-full md:w-auto px-3 py-1.5 border border-[#5E5240]/[0.2] rounded-lg bg-[#FCFCF9] focus:border-[#21808D] focus:ring-1 focus:ring-[#21808D]/50 outline-none text-sm"
            >
                <option value="new">جديد</option>
                <option value="confirmed">مؤكد</option>
                <option value="in-progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
            </select>
        </div>
    );
}

export default AdminPage;