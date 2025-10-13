
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

// This is the single, authoritative Booking type. The server now guarantees this structure.
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

  // Optional fields
  email?: string;
  notes?: string;
  location?: Location | null;
  paymentProof?: Photo | null;
  basePrice?: number;
  discountAmount?: number;
  advancePayment?: number;
  service?: SelectedService; // CORRECTED TYPE: Was string, is now an object for backward compatibility.
}

// Centralized interface for the main application data constant
export interface AppData {
  company_info: {
    name_ar: string;
    name_en: string;
    description_ar: string;
    phone: string;
    whatsapp: string;
    payment_number: string;
    email: string;
    locations: string[];
    working_hours: string;
  };
  admin_credentials: {
    username: string;
    password: string;
  };
  services: Service[];
  config: {
    imgbb_api_key: string;
    whatsapp_number: string;
    payment_number: string;
    minimum_area: number;
    discount_percentage: number;
    advance_payment_percentage: number;
  };
}