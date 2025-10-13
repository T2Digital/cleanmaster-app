import { Booking, BookingData, BookingStatus } from "../types";

const API_BASE_URL = 'https://europe-west1-cleanmaster-app-65622056-6e2da.cloudfunctions.net/api';

// Function to get all bookings
export const getBookings = async (): Promise<Booking[]> => {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) {
        throw new Error('Failed to fetch bookings');
    }
    const data = await response.json();
    // Sort bookings by timestamp descending (newest first)
    return data.sort((a: Booking, b: Booking) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Function to create a new booking
export const createBooking = async (bookingData: BookingData): Promise<Booking> => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
        throw new Error('Failed to create booking');
    }
    return response.json();
};

// Function to update a booking's status
export const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<Booking> => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Update failed with PUT:", errorText);
        throw new Error('Failed to update booking status');
    }
    return response.json();
};
