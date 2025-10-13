
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express, { Request, Response } from "express";
import cors from "cors";
import { Booking, SelectedService, Photo } from "./types";

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// This function builds a booking object that is compatible with BOTH client and server.
const buildCompatibleBooking = (id: string, data: admin.firestore.DocumentData | undefined): Booking => {
    if (!data) throw new Error(`Data for booking ${id} is undefined.`);
    let unifiedServices: SelectedService[] = Array.isArray(data.services) ? data.services : [];
    const legacyServiceField = unifiedServices.length > 0 ? unifiedServices[0] : undefined;
    const safeTimestamp = (data.timestamp?.toDate) ? data.timestamp.toDate().toISOString() : new Date().toISOString();
    
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
        services: unifiedServices,
        service: legacyServiceField, // Maintain for old client compatibility
        photos: data.photos || [],
        email: data.email,
        notes: data.notes,
        location: data.location,
        paymentProof: data.paymentProof,
        basePrice: data.basePrice,
        discountAmount: data.discountAmount,
        advancePayment: data.advancePayment,
    };
}

// THE GUARANTEED FIX: This function translates old data structures to the new one BEFORE saving.
const normalizeIncomingBooking = (body: any): any => {
    const normalizedData = { ...body };
    // If the old 'service' field exists and the new 'services' array does NOT...
    if (normalizedData.service && !normalizedData.services) {
        // ...translate it to the new structure.
        normalizedData.services = [normalizedData.service];
    }
    // We no longer need the old field in the database itself, cleaning up our data.
    delete normalizedData.service;
    return normalizedData;
};

// GET /bookings - Returns a compatible, unified list. (Already robust)
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
        res.status(200).send(bookings);
    } catch (error: any) {
        functions.logger.error(`Catastrophic failure in GET /bookings.`, { error: error.message });
        res.status(500).send({ error: 'The server failed catastrophically.' });
    }
});

// POST /bookings - NOW WITH PRE-SAVE TRANSLATION. THIS IS THE FINAL FIX.
app.post('/bookings', async (req: Request, res: Response) => {
    try {
        // 1. Translate the incoming data to the GUARANTEED modern structure.
        const translatedData = normalizeIncomingBooking(req.body);

        // 2. Add server-side fields.
        const dataToSave = { 
            ...translatedData, 
            status: 'new', 
            timestamp: admin.firestore.FieldValue.serverTimestamp() 
        };

        // 3. Save the clean, modern structure to Firestore.
        const docRef = await db.collection('bookings').add(dataToSave);
        const newDoc = await docRef.get();
        
        // 4. Build a compatible response for the client.
        const newBooking = buildCompatibleBooking(newDoc.id, newDoc.data());
        
        // 5. Send the successful response.
        res.status(201).send(newBooking);
    } catch (error: any) { 
        functions.logger.error("Error creating booking:", {
            errorMessage: error.message,
            requestBody: req.body, // Log the original body for debugging
        });
        res.status(500).send({ error: "Failed to create booking." }); 
    }
});

// PUT /bookings/:bookingId/status - Returns a compatible, unified object. (Already robust)
app.put('/bookings/:bookingId/status', async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        const docRef = db.collection('bookings').doc(bookingId);
        await docRef.update({ status });
        const updatedDoc = await docRef.get();
        const updatedBooking = buildCompatibleBooking(updatedDoc.id, updatedDoc.data());
        res.status(200).send(updatedBooking);
    } catch (error: any) { 
        functions.logger.error(`Error updating status for ${req.params.bookingId}:`, error);
        res.status(500).send({ message: "Failed to update status." });
    }
});

export const api = functions.region('europe-west1').https.onRequest(app);
