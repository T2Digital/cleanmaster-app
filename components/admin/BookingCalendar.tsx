
import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus } from '../../types';

// Updated colors: 'in-progress' changed to gray/neutral as requested
const statusColors: Record<BookingStatus, string> = {
    'new': '#3a86ff',        // Blue: For new, unconfirmed bookings
    'confirmed': '#ffbe0b',   // Yellow: Confirmed, awaiting action
    'in-progress': '#6c757d', // Gray: Actively being worked on (Requested change from orange/red)
    'completed': '#2a9d8f',   // Green/Teal: Successfully completed
    'cancelled': '#e63946'    // Red: Cancelled booking
};

interface BookingCalendarProps {
    bookings: Booking[];
    onEventClick: (booking: Booking) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings, onEventClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const bookingsByDate = useMemo(() => {
        const map = new Map<string, Booking[]>();
        if(bookings) {
            bookings.forEach(booking => {
                if (booking && booking.date) {
                    const dateKey = booking.date; // The date is already in 'YYYY-MM-DD' format
                    if (!map.has(dateKey)) {
                        map.set(dateKey, []);
                    }
                    map.get(dateKey)!.push(booking);
                }
            });
        }
        return map;
    }, [bookings]);

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const lastDayOfPrevMonth = new Date(year, month, 0);

    const paddingDaysCount = (firstDay.getDay() + 1) % 7;
    const allCalendarDays = [];

    // FIX: Using explicit string construction for keys to avoid any Timezone/Date object shifts.
    const constructDateString = (y: number, m: number, d: number) => {
        // m is 0-indexed here
        // Adjust for month rollover if needed (though the logic below handles limits)
        // But simplest is to just use the numbers we have since we iterate valid ranges.
        // NOTE: We need to handle year/month boundaries if we were calculating offsets, 
        // but here we iterate known valid days for specific months.
        
        // However, previous month logic might cross year boundary.
        const dateObj = new Date(y, m, d);
        const vy = dateObj.getFullYear();
        const vm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const vd = String(dateObj.getDate()).padStart(2, '0');
        return `${vy}-${vm}-${vd}`;
    };

    // Add previous month's padding days
    for (let i = 0; i < paddingDaysCount; i++) {
        const day = lastDayOfPrevMonth.getDate() - paddingDaysCount + i + 1;
        const dateKey = constructDateString(year, month - 1, day);
        const dateObj = new Date(year, month - 1, day);
        allCalendarDays.push({ day, isCurrentMonth: false, date: dateObj, key: dateKey });
    }

    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dateKey = constructDateString(year, month, i);
        const dateObj = new Date(year, month, i);
        allCalendarDays.push({ day: i, isCurrentMonth: true, date: dateObj, key: dateKey });
    }

    // Add next month's padding days
    const totalCells = allCalendarDays.length > 35 ? 42 : 35; 
    const remainingCells = totalCells - allCalendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
        const dateKey = constructDateString(year, month + 1, i);
        const dateObj = new Date(year, month + 1, i);
        allCalendarDays.push({ day: i, isCurrentMonth: false, date: dateObj, key: dateKey });
    }

    const today = new Date();

    return (
        <div className="bg-[#FCFCF9] p-4 rounded-lg shadow-sm border border-[#5E5240]/[0.12]">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="px-4 py-2 bg-[#21808D] text-white rounded-lg hover:bg-[#1D7480] transition-colors"><i className="fas fa-chevron-right"></i></button>
                <h2 className="text-xl font-bold text-center">
                    {currentDate.toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => changeMonth(1)} className="px-4 py-2 bg-[#21808D] text-white rounded-lg hover:bg-[#1D7480] transition-colors"><i className="fas fa-chevron-left"></i></button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Weekday Headers */}
                {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(day => (
                    <div key={day} className="text-center font-semibold text-sm text-[#626C71] py-2">{day}</div>
                ))}

                {/* Day Cells */}
                {allCalendarDays.map((dayData) => {
                    const bookingsForDay = bookingsByDate.get(dayData.key) || [];
                    const isToday = today.getFullYear() === dayData.date.getFullYear() &&
                                  today.getMonth() === dayData.date.getMonth() &&
                                  today.getDate() === dayData.date.getDate();

                    return (
                        <div key={dayData.key} className={`border border-gray-200 min-h-[120px] rounded-md p-1.5 flex flex-col ${dayData.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}>
                            <div className={`text-sm font-semibold mb-1 ${dayData.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'} ${isToday ? 'bg-[#21808D] text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                                {dayData.day}
                            </div>
                            <div className="space-y-1 overflow-y-auto custom-scrollbar max-h-[80px]">
                                {bookingsForDay.map(booking => {
                                    const servicesTitle = (booking.services && Array.isArray(booking.services))
                                        ? booking.services.map(s => s.name_ar).join(', ')
                                        : 'لا توجد خدمات';
                                    
                                    return (
                                        <div
                                            key={booking.bookingId}
                                            onClick={() => onEventClick(booking)}
                                            className="text-xs text-white p-1 rounded cursor-pointer truncate hover:opacity-90 shadow-sm"
                                            style={{ backgroundColor: statusColors[booking.status] || '#6c757d' }}
                                            title={`${booking.customerName} - ${servicesTitle}`}
                                        >
                                            {booking.customerName}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BookingCalendar;
