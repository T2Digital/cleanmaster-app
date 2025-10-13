import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express, { Request, Response } from "express";
import cors from "cors";
import { Booking, SelectedService, Photo } from "./types";
import { appData } from './constants'; // THE CORRECT IMPORT

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// THE CORRECTED ENDPOINT
app.get('/constants', (req: Request, res: Response) => {
    try {
        res.status(200).send(appData); // SENDING THE CORRECT OBJECT
    } catch (error: any) {
        functions.logger.error("Failed to fetch constants", { error: error.message });
        res.status(500).send({ error: "Failed to fetch constants." });
    }
});

// All other code remains the same...
const fallbackService: SelectedService = {
    id: "unknown", name_ar: "خدمة غير محددة", price: 0, type: "unknown",
    description_ar: "هذا الحجز لا يحتوي على خدمة مسجلة بشكل صحيح.",
    icon: "fas fa-question-circle", includes: [], video_url: ""
};

const buildCompatibleBooking = (id: string, data: admin.firestore.DocumentData | undefined): Booking => {
    if (!data) throw new Error(`Data for booking ${id} is undefined.`);
    let unifiedServices: SelectedService[] = [];
    if (Array.isArray(data.services) && data.services.length > 0) {
        unifiedServices = data.services;
    } else if (data.service && typeof data.service === 'object') {
        unifiedServices = [data.service as SelectedService];
    }
    let legacyServiceField = unifiedServices.length > 0 ? unifiedServices[0] : undefined;
    if (!legacyServiceField) {
        functions.logger.warn(`Booking ${id} has no valid service. Using fallback to prevent crash.`);
        legacyServiceField = fallbackService;
    }
    const safeTimestamp = (data.timestamp?.toDate) ? data.timestamp.toDate().toISOString() : new Date().toISOString();
    return {
        bookingId: id, timestamp: safeTimestamp, status: data.status || 'new',
        customerName: data.customerName || 'اسم غير متوفر', phone: data.phone || 'هاتف غير متوفر',
        address: data.address || 'عنوان غير متوفر', date: data.date || '', time: data.time || '',
        finalPrice: data.finalPrice || 0, paymentMethod: data.paymentMethod || 'cash',
        services: unifiedServices, service: legacyServiceField, photos: data.photos || [],
        email: data.email, notes: data.notes, location: data.location,
        paymentProof: data.paymentProof, basePrice: data.basePrice,
        discountAmount: data.discountAmount, advancePayment: data.advancePayment,
    };
};

const normalizeIncomingBooking = (body: any): any => {
    const normalizedData = { ...body };
    if (normalizedData.service && !normalizedData.services) {
        normalizedData.services = [normalizedData.service];
    }
    delete normalizedData.service;
    return normalizedData;
};

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

app.post('/bookings', async (req: Request, res: Response) => {
    try {
        const translatedData = normalizeIncomingBooking(req.body);
        const dataToSave = { ...translatedData, status: 'new', timestamp: admin.firestore.FieldValue.serverTimestamp() };
        const docRef = await db.collection('bookings').add(dataToSave);
        const newDoc = await docRef.get();
        const newBooking = buildCompatibleBooking(newDoc.id, newDoc.data());
        res.status(201).send(newBooking);
    } catch (error: any) {
        functions.logger.error("Error creating booking:", { errorMessage: error.message, requestBody: req.body });
        res.status(500).send({ error: "Failed to create booking." });
    }
});

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
