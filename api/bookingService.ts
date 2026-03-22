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
    // THE FIX: Use JSON.stringify and JSON.parse as the ultimate sanitization method.
    // This is a robust way to strip all non-serializable properties, Proxy wrappers,
    // and circular references from the React state object, converting it into a
    // Plain Old JavaScript Object (POJO) that Firestore can safely handle.
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
      // Add server-generated fields
      bookingId: generateBookingId(),
      status: 'new',
      timestamp: new Date().toISOString(),
    };

    await addDoc(collection(db, "bookings"), newBooking);
    
    // Return the full booking data that was saved.
    return newBooking;

  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not create booking");
  }
};

// Get bookings - all or by phone number
export const getBookings = async (phone?: string): Promise<Booking[]> => {
  try {
    const bookingsCollection = collection(db, "bookings");
    const q = phone
      ? query(bookingsCollection, where("phone", "==", phone))
      : query(bookingsCollection);

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    querySnapshot.forEach((doc) => {
      // Add the firestore doc id to the object if needed later, for now data is sufficient
      bookings.push({ ...doc.data() } as Booking);
    });

    // Sort by timestamp descending to show newest first
    return bookings.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw new Error("Could not retrieve bookings");
  }
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
): Promise<Booking | null> => {
  try {
    const bookingsCollection = collection(db, "bookings");
    const q = query(bookingsCollection, where("bookingId", "==", bookingId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("No booking found with ID:", bookingId);
      return null;
    }

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
    throw new Error("Could not update booking status");
  }
};
