
import React, { useState, useEffect, createContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import OrdersPage from './components/pages/OrdersPage';
import AdminPage from './components/pages/AdminPage';
import PwaInstallBanner from './components/PwaInstallBanner';
import MessageContainer from './components/MessageContainer';
import { Service } from './types';

interface Message {
  id: number;
  text: string;
  type: 'info' | 'success' | 'error';
}

interface AppContextType {
  showMessage: (text: string, type?: 'info' | 'success' | 'error') => void;
  openBookingModal: (service?: Service | null) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

function App() {
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const showMessage = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    const newMessage = {
      id: Date.now(),
      text,
      type,
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
    }, 5000);
  };

  const removeMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };
  
  const openBookingModal = (service: Service | null = null) => {
      setPreselectedService(service);
      setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
      setBookingModalOpen(false);
      setPreselectedService(null);
  };

  return (
    <AppContext.Provider value={{ showMessage, openBookingModal }}>
      <div className="bg-[#FCFCF9] text-[#13343B] min-h-screen">
        <PwaInstallBanner />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage isBookingModalOpen={isBookingModalOpen} closeBookingModal={closeBookingModal} preselectedService={preselectedService} />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
        <MessageContainer messages={messages} removeMessage={removeMessage} />
      </div>
    </AppContext.Provider>
  );
}

export default App;
