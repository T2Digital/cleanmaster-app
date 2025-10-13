
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Booking, BookingStatus } from '../types';
import BookingDetailModal from './BookingDetailModal';

interface BookingCalendarProps {
    bookings: Booking[];
    onStatusChange: (bookingId: string, status: BookingStatus) => Promise<void>;
}

const statusColors: Record<BookingStatus, string> = {
    'new': '#3a86ff',       // blue
    'confirmed': '#2a9d8f',   // green
    'in-progress': '#e9c46a', // orange
    'completed': '#6c757d',   // grey
    'cancelled': '#e76f51'    // red
};

const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings, onStatusChange }) => {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const events = bookings.map(booking => {
        // FLEXIBLE SERVICE NAME EXTRACTION
        let serviceNames = 'خدمة غير متوفرة';
        if (booking.services && booking.services.length > 0) {
            serviceNames = booking.services.map(s => s.name_ar).join(', ');
        } else if (booking.service) {
            serviceNames = booking.service.name_ar;
        }

        return {
            id: booking.bookingId,
            title: `${booking.customerName} - ${serviceNames}`,
            start: `${booking.date}T${booking.time}`,
            backgroundColor: statusColors[booking.status],
            borderColor: statusColors[booking.status],
            extendedProps: {
                ...booking
            }
        };
    });

    const handleEventClick = (clickInfo: any) => {
        setSelectedBooking(clickInfo.event.extendedProps as Booking);
    };

    const handleCloseModal = () => {
        setSelectedBooking(null);
    };

    return (
        <>
            <div className="bg-[#FCFCF9] p-4 rounded-lg shadow-sm border border-[#5E5240]/[0.12]">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                    }}
                    initialView="dayGridMonth"
                    events={events}
                    locale="ar"
                    direction="rtl"
                    buttonText={{
                        today: 'اليوم',
                        month: 'شهر',
                        week: 'أسبوع',
                        day: 'يوم',
                        list: 'قائمة'
                    }}
                    eventClick={handleEventClick}
                    height="auto"
                />
            </div>
            
            <BookingDetailModal 
                booking={selectedBooking} 
                onClose={handleCloseModal} 
                onStatusChange={onStatusChange}
            />
        </>
    );
};

export default BookingCalendar;
