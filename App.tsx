import React, { useState, useEffect, createContext, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import OrdersPage from './components/pages/OrdersPage';
import AdminPage from './components/pages/AdminPage';
import PwaInstallBanner from './components/PwaInstallBanner';
import MessageContainer from './components/MessageContainer';
import ChatBot from './components/ChatBot';
import AdminFloatingButton from './components/AdminFloatingButton';
import { Service, Booking } from './types';
import { seedServicesIfEmpty } from './api/servicesApi';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface Message {
  id: number;
  text: string;
  type: 'info' | 'success' | 'error';
}

interface AppContextType {
  showMessage: (text: string, type?: 'info' | 'success' | 'error') => void;
  openBookingModal: (service?: Service | null) => void;
  openChatBot: () => void;
  toggleChatBot: () => void;
  isChatBotOpen: boolean;
  services: Service[];
  refreshServices: () => Promise<void>;
  isAdminLoggedIn: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

function App() {
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('cleanmaster_admin_auth') === 'true');

  const location = useLocation();
  const previousBookingsRef = useRef<Booking[]>([]);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const fetchServices = async () => {
      try {
          const data = await seedServicesIfEmpty();
          setServices(data || []);
      } catch (error) {
          console.error("Failed to load services", error);
          // showMessage("فشل تحميل قائمة الخدمات، سيتم استخدام البيانات المحلية", "info");
      }
  };

  useEffect(() => {
      fetchServices();
  }, []);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedBookings: Booking[] = [];
        snapshot.forEach((doc) => fetchedBookings.push({ ...doc.data() } as Booking));

        if (isFirstLoadRef.current) {
            previousBookingsRef.current = fetchedBookings;
            isFirstLoadRef.current = false;
            return;
        }

        const prevBookings = previousBookingsRef.current;
        const userPhone = localStorage.getItem('cleanmaster_user_phone');

        if (isAdminLoggedIn && fetchedBookings.length > prevBookings.length) {
            const newBooking = fetchedBookings[0];
            if (newBooking.status === 'new') {
                 showMessage(`🔔 حجز جديد: ${newBooking.customerName}`, 'info');
                 if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification("حجز جديد - كلين ماستر", { body: `العميل: ${newBooking.customerName}`, icon: "https://i.ibb.co/f52dPHc/1000049048.jpg" });
                 }
            }
        }

        if (userPhone) {
            fetchedBookings.forEach(booking => {
                if (booking.phone === userPhone) {
                    const oldVersion = prevBookings.find(b => b.bookingId === booking.bookingId);
                    if (oldVersion && oldVersion.status !== booking.status) {
                        showMessage("تحديث جديد في حالة طلبك! تفقد 'طلباتي'", 'success');
                    }
                }
            });
        }
        previousBookingsRef.current = fetchedBookings;
    }, (err) => {
        console.warn("Firestore listener error (possibly due to offline mode):", err);
    });

    return () => unsubscribe();
  }, [isAdminLoggedIn]);

  const showMessage = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    const newMessage = { id: Date.now(), text, type };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => setMessages(prev => prev.filter(m => m.id !== newMessage.id)), 5000);
  };

  const removeMessage = (id: number) => setMessages(prev => prev.filter(m => m.id !== id));
  const openBookingModal = (service: Service | null = null) => { setPreselectedService(service); setBookingModalOpen(true); };
  const closeBookingModal = () => { setBookingModalOpen(false); setPreselectedService(null); };
  const openChatBot = () => setIsChatBotOpen(true);
  const toggleChatBot = () => setIsChatBotOpen(prev => !prev);
  const loginAdmin = () => { setIsAdminLoggedIn(true); localStorage.setItem('cleanmaster_admin_auth', 'true'); };
  const logoutAdmin = () => { setIsAdminLoggedIn(false); localStorage.removeItem('cleanmaster_admin_auth'); };

  return (
    <AppContext.Provider value={{ 
        showMessage, openBookingModal, openChatBot, toggleChatBot, 
        isChatBotOpen, services, refreshServices: fetchServices,
        isAdminLoggedIn, loginAdmin, logoutAdmin
    }}>
      <div className="bg-[#FCFCF9] text-[#13343B] min-h-screen relative overflow-x-hidden animate-fadeIn">
        <PwaInstallBanner />
        <Header />
        <main className="pt-[75px]">
          <Routes>
            <Route path="/" element={<HomePage isBookingModalOpen={isBookingModalOpen} closeBookingModal={closeBookingModal} preselectedService={preselectedService} />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
        <ChatBot />
        <AdminFloatingButton />
        <MessageContainer messages={messages} removeMessage={removeMessage} />
      </div>
    </AppContext.Provider>
  );
}

export default App;