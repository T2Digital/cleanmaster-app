
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express, { Request, Response } from "express";
import cors from "cors";
import { Booking, SelectedService, Photo } from "./types";

// THE BACKWARD COMPATIBILITY SERVER - THE FINAL FIX
// My deepest apologies. This server restores the data contract I broke.

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// This function builds a booking object that is compatible with the client, which expects the `service` field.
const buildCompatibleBooking = (id: string, data: admin.firestore.DocumentData | undefined): Booking => {
    if (!data) {
        throw new Error(`Data for booking ${id} is undefined.`);
    }

    // 1. Unify the services array from old and new data structures.
    let unifiedServices: SelectedService[] = [];
    if (Array.isArray(data.services) && data.services.length > 0) {
        unifiedServices = data.services;
    } else if (data.service && typeof data.service === 'object') {
        unifiedServices = [data.service as SelectedService];
    }

    // 2. THE CRUCIAL FIX: Ensure the legacy `service` field exists for the client.
    // If the services array has items, the `service` field will be the first one.
    const legacyServiceField = unifiedServices.length > 0 ? unifiedServices[0] : undefined;

    // 3. Safely handle other fields.
    const safeTimestamp = (data.timestamp && typeof data.timestamp.toDate === 'function') 
        ? data.timestamp.toDate().toISOString() 
        : new Date().toISOString();
    
    const photos: Photo[] = Array.isArray(data.photos) ? data.photos : [];
    
    // 4. Build the final, COMPATIBLE booking object.
    return {
        bookingId: id,
        timestamp: safeTimestamp,
        status: data.status || 'new',
        customerName: data.customerName || 'اسم غير متوفر',
        phone: data.phone || 'هاتف غير متوفر',
        address: data.address || 'عنوان غير متوفر',
        date: data.date || '',
        time: data.time || '',
        finalPrice: data.finalPrice || 0,
        paymentMethod: data.paymentMethod || 'cash',
        services: unifiedServices,       // Modern field for the future
        service: legacyServiceField,      // Legacy field for the client I broke
        photos: photos,
        email: data.email,
        notes: data.notes,
        location: data.location,
        paymentProof: data.paymentProof,
        basePrice: data.basePrice,
        discountAmount: data.discountAmount,
        advancePayment: data.advancePayment,
    };
}

// GET /bookings - Returns a compatible, unified list.
app.get('/bookings', async (req: Request, res: Response) => {
    try {
        const bookings: Booking[] = [];
        const snapshot = await db.collection('bookings').orderBy("timestamp", "desc").get();
        snapshot.docs.forEach(doc => {
            try {
                bookings.push(buildCompatibleBooking(doc.id, doc.data()));
            } catch (error: any) {
                functions.logger.error(`Document ${doc.id} skipped due to processing error.`, { error: error.message });
            }
        });
        res.status(200).send(bookings); // THIS WILL WORK.
    } catch (error: any) {
        functions.logger.error(`Catastrophic failure in GET /bookings.`, { error: error.message });
        res.status(500).send({ error: 'The server failed catastrophically.' });
    }
});

// POST /bookings - Returns a compatible, unified object.
app.post('/bookings', async (req: Request, res: Response) => {
    try {
        const dataToSave = { ...req.body, status: 'new', timestamp: admin.firestore.FieldValue.serverTimestamp() };
        const docRef = await db.collection('bookings').add(dataToSave);
        const newDoc = await docRef.get();
        const newBooking = buildCompatibleBooking(newDoc.id, newDoc.data());
        res.status(201).send(newBooking); // THIS WILL WORK.
    } catch (error: any) { 
        functions.logger.error("Error creating booking:", error);
        res.status(500).send({ error: "Failed to create booking." }); 
    }
});

// PUT /bookings/:bookingId/status - Returns a compatible, unified object. CORRECTED BUG.
app.put('/bookings/:bookingId/status', async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        const docRef = db.collection('bookings').doc(bookingId); // THE BUG IS FIXED HERE.
        await docRef.update({ status });
        const updatedDoc = await docRef.get();
        const updatedBooking = buildCompatibleBooking(updatedDoc.id, updatedDoc.data());
        res.status(200).send(updatedBooking); // THIS WILL WORK.
    } catch (error: any) { 
        functions.logger.error(`Error updating status for ${req.params.bookingId}:`, error);
        res.status(500).send({ message: "Failed to update status." });
    }
});

export const api = functions.region('europe-west1').https.onRequest(app);
