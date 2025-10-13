"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
admin.initializeApp();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// GET all bookings
app.get('/bookings', async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection('bookings').get();
        const bookings = [];
        snapshot.forEach(doc => {
            bookings.push(Object.assign({ bookingId: doc.id }, doc.data()));
        });
        res.status(200).send(bookings);
    }
    catch (error) {
        functions.logger.error("Error getting bookings:", error);
        res.status(500).send({ error: 'Internal server error' });
    }
});
// POST a new booking - THE ABSOLUTE FINAL, LOG-CONFIRMED FIX
app.post('/bookings', async (req, res) => {
    try {
        const receivedData = req.body;
        if (!receivedData || Object.keys(receivedData).length === 0) {
            return res.status(400).send({ error: 'Missing booking data.' });
        }
        let serviceName;
        if (receivedData.service) {
            serviceName = receivedData.service;
        }
        else if (receivedData.services && Array.isArray(receivedData.services) && receivedData.services.length > 0) {
            const serviceNames = receivedData.services
                .map((s) => s.name || s.name_ar)
                .filter(Boolean);
            if (serviceNames.length > 0) {
                serviceName = serviceNames.join(', ');
            }
        }
        const newBooking = {
            customerName: receivedData.name || receivedData.customerName || null,
            // THE REAL FIX: Default to null if email is not provided, instead of undefined.
            customerEmail: receivedData.email || receivedData.customerEmail || null,
            customerPhone: receivedData.phone || receivedData.customerPhone || null,
            service: serviceName,
            date: receivedData.date,
            time: receivedData.time,
            address: receivedData.address,
            status: receivedData.status || 'pending',
            finalPrice: receivedData.price || receivedData.finalPrice,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            allBookingData: receivedData // Keep a record of the original request
        };
        // The validation was fine, the data itself was the problem.
        if (!newBooking.customerName || !newBooking.service || !newBooking.date || !newBooking.time) {
            functions.logger.error("Validation failed post-processing. This shouldn't happen.", { booking: newBooking });
            return res.status(400).send({ error: `Critical field was missing after processing.` });
        }
        const docRef = await admin.firestore().collection('bookings').add(newBooking);
        res.status(201).send(Object.assign({ bookingId: docRef.id }, newBooking));
    }
    catch (error) {
        functions.logger.error("Catastrophic failure in /bookings endpoint:", error);
        res.status(500).send({
            message: "An unexpected server error occurred.",
            error_details: error.message
        });
    }
});
// PUT (Update) booking status
app.put('/bookings/:bookingId/status', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).send({ error: 'Status is required' });
        }
        await admin.firestore().collection('bookings').doc(bookingId).update({ status });
        const updatedDoc = await admin.firestore().collection('bookings').doc(bookingId).get();
        res.status(200).send(Object.assign({ bookingId: updatedDoc.id }, updatedDoc.data()));
    }
    catch (error) {
        functions.logger.error(`Error updating status for booking ${req.params.bookingId}:`, error);
        res.status(500).send({
            message: "Failed to update status.",
            error_details: error.message
        });
    }
});
exports.api = functions.region('europe-west1').https.onRequest(app);
