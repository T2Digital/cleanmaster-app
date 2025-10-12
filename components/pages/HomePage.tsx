
import React, { useState, useContext, useEffect } from 'react';
import Hero from '../sections/Hero';
import ServicesSection from '../sections/ServicesSection';
import WhyUsSection from '../sections/WhyUsSection';
import ContactSection from '../sections/ContactSection';
import Modal from '../Modal';
import ServiceModalContent from '../ServiceModalContent';
import BookingForm from '../BookingForm';
import { Service } from '../../types';
import { AppContext } from '../../App';

interface HomePageProps {
    isBookingModalOpen: boolean;
    closeBookingModal: () => void;
    preselectedService: Service | null;
}

const HomePage: React.FC<HomePageProps> = ({ isBookingModalOpen, closeBookingModal, preselectedService }) => {
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const appContext = useContext(AppContext);
    
    const openServiceModal = (service: Service) => {
        setSelectedService(service);
        setServiceModalOpen(true);
    };

    const closeServiceModal = () => {
        setServiceModalOpen(false);
        setSelectedService(null);
    };
    
    // This effect ensures that if the global state opens the booking modal,
    // the service detail modal is closed.
    useEffect(() => {
        if(isBookingModalOpen) {
            setServiceModalOpen(false);
        }
    }, [isBookingModalOpen]);

    return (
        <>
            <Hero />
            <ServicesSection onServiceClick={openServiceModal} />
            <WhyUsSection />
            <ContactSection />

            <Modal isOpen={isServiceModalOpen} onClose={closeServiceModal}>
                {selectedService && <ServiceModalContent service={selectedService} />}
            </Modal>
            
            <Modal isOpen={isBookingModalOpen} onClose={closeBookingModal} size="large">
                <BookingForm preSelectedService={preselectedService} onClose={closeBookingModal}/>
            </Modal>
        </>
    );
};

export default HomePage;
