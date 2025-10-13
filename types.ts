
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

export type BookingStatus = "new" | "confirmed" | "in-progress" | "completed" | "cancelled";

export interface Booking {
  bookingId: string;
  timestamp: string; 
  status: BookingStatus;
  customerName: string;
  phone: string;
  address: string;
  date: string;
  time: string;
  finalPrice: number;
  paymentMethod: 'cash' | 'electronic';
  services: SelectedService[]; 
  photos: Photo[];
  email?: string;
  notes?: string;
  location?: Location | null;
  paymentProof?: Photo | null;
  basePrice?: number;
  discountAmount?: number;
  advancePayment?: number;
}
