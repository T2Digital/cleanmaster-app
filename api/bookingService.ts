import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { Booking, BookingStatus } from "../types";

// Function to generate a simple booking ID
const generateBookingId = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${timestamp}-${random}`;
};

// Create a new booking
export const createBooking = async (
  bookingData: Partial<Booking>
): Promise<Booking> => {
  try {
    if (!db) throw new Error("Database not initialized");

    const pojoBookingData = JSON.parse(JSON.stringify(bookingData));

    const newBooking: Booking = {
      services: pojoBookingData.services || [],
      basePrice: pojoBookingData.basePrice || 0,
      paymentMethod: pojoBookingData.paymentMethod || 'cash',
      customerName: pojoBookingData.customerName || '',
      phone: pojoBookingData.phone || '',
      email: pojoBookingData.email || '',
      address: pojoBookingData.address || '',
      date: pojoBookingData.date || '',
      time: pojoBookingData.time || '',
      notes: pojoBookingData.notes || '',
      location: pojoBookingData.location || null,
      photos: pojoBookingData.photos || [],
      paymentProof: pojoBookingData.paymentProof || null,
      finalPrice: pojoBookingData.finalPrice || 0,
      discountAmount: pojoBookingData.discountAmount || 0,
      advancePayment: pojoBookingData.advancePayment || 0,
      bookingId: generateBookingId(),
      status: 'new',
      timestamp: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "bookings"), newBooking);
    return newBooking;

  } catch (e: any) {
    console.error("Firestore Creation Error:", e);
    // Fallback to local success if UI requires continuation, but throw for awareness
    throw new Error(e.message || "Could not create booking");
  }
};

// Get bookings - all or by phone number
export const getBookings = async (phone?: string): Promise<Booking[]> => {
  try {
    if (!db) return [];
    const bookingsCollection = collection(db, "bookings");
    const q = phone
      ? query(bookingsCollection, where("phone", "==", phone))
      : query(bookingsCollection);

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ ...doc.data() } as Booking);
    });

    return bookings.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (e) {
    console.error("Error getting documents: ", e);
    return [];
  }
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
): Promise<Booking | null> => {
  try {
    if (!db) return null;
    const bookingsCollection = collection(db, "bookings");
    const q = query(bookingsCollection, where("bookingId", "==", bookingId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const bookingDoc = querySnapshot.docs[0];
    const docRef = doc(db, "bookings", bookingDoc.id);
    await updateDoc(docRef, { status });

    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
      return updatedDoc.data() as Booking;
    }
    return null;
  } catch (e) {
    console.error("Error updating document: ", e);
    return null;
  }
};