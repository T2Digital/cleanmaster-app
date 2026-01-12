
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  writeBatch
} from "firebase/firestore";
import { Service } from "../types";
import { appData } from "../constants";

const COLLECTION_NAME = "services";

// Get all services
export const getServices = async (): Promise<Service[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const services: Service[] = [];
    querySnapshot.forEach((doc) => {
      services.push(doc.data() as Service);
    });
    return services;
  } catch (e) {
    console.error("Error getting services: ", e);
    throw new Error("Could not retrieve services");
  }
};

// Update a service
export const updateService = async (serviceId: string, updates: Partial<Service>): Promise<void> => {
  try {
    const serviceRef = doc(db, COLLECTION_NAME, serviceId);
    await updateDoc(serviceRef, updates);
  } catch (e) {
    console.error("Error updating service: ", e);
    throw new Error("Could not update service");
  }
};

// Seed services if collection is empty (First run)
export const seedServicesIfEmpty = async (): Promise<Service[]> => {
  try {
    const services = await getServices();
    if (services.length > 0) {
      return services;
    }

    // Collection is empty, seed from constants
    console.log("Seeding services to Firestore...");
    const batch = writeBatch(db);
    
    appData.services.forEach((service) => {
      const docRef = doc(db, COLLECTION_NAME, service.id);
      batch.set(docRef, service);
    });

    await batch.commit();
    return appData.services;
  } catch (e) {
    console.error("Error seeding services: ", e);
    return appData.services; // Fallback to static data
  }
};
