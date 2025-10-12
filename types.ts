
export type ServiceType = "meter" | "fixed" | "consultation";

export interface Service {
  id: string;
  name_ar: string;
  price: number;
  type: ServiceType;
  description_ar: string;
  icon: string;
  includes: string[];
  video_url?: string;
}

export interface SelectedService extends Service {
    quantity: number;
    totalPrice: number;
}

export interface Photo {
    url: string;
    thumb: string;
    title: string;
    delete_url: string;
}

export interface Location {
    latitude: number;
    longitude: number;
    url: string;
    accuracy: number;
}

export type BookingStatus = "new" | "confirmed" | "in-progress" | "completed";

export interface Booking {
  services: SelectedService[];
  basePrice: number;
  paymentMethod: 'cash' | 'electronic';
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  date: string;
  time: string;
  notes?: string;
  location: Location | null;
  photos: Photo[];
  paymentProof: Photo | null;
  bookingId: string;
  timestamp: string;
  status: BookingStatus;
  finalPrice: number;
  discountAmount: number;
  advancePayment: number;
}