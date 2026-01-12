
import React, { useState, useContext, useEffect } from 'react';
import Hero from '../sections/Hero';
import ServicesSection from '../sections/ServicesSection';
import StatsSection from '../sections/StatsSection';
import WhyUsSection from '../sections/WhyUsSection';
import ContactSection from '../sections/ContactSection';
import TestimonialsSection from '../sections/TestimonialsSection';
import Modal from '../Modal';
import ServiceModalContent from '../ServiceModalContent';
import BookingForm from '../BookingForm';
import SEO from '../SEO';
import { Service } from '../../types';
import { AppContext } from '../../App';
import { appData } from '../../constants';

interface HomePageProps {
    isBookingModalOpen: boolean;
    closeBookingModal: () => void;
    preselectedService: Service | null;
}

const HomePage: React.FC<HomePageProps> = ({ isBookingModalOpen, closeBookingModal, preselectedService }) => {
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const appContext = useContext(AppContext);
    
    // Dynamic SEO State
    const [seoData, setSeoData] = useState({
        title: "كلين ماستر - رائد خدمات التنظيف في مصر ✨",
        description: appData.company_info.description_ar,
        keywords: ["شركة تنظيف", "تنظيف منازل", "غسيل سجاد", "كلين ماستر"],
        schema: undefined as object | undefined
    });

    const openServiceModal = (service: Service) => {
        setSelectedService(service);
        setServiceModalOpen(true);
        
        // Update SEO when service modal opens
        if (service.seo) {
            setSeoData({
                title: `${service.seo.title}`,
                description: service.seo.description,
                keywords: service.seo.keywords,
                schema: {
                    "@context": "https://schema.org",
                    "@type": "Service",
                    "name": service.name_ar,
                    "provider": {
                        "@type": "LocalBusiness",
                        "name": "Clean Master"
                    },
                    "description": service.description_ar,
                    "offers": {
                        "@type": "Offer",
                        "price": service.price,
                        "priceCurrency": "EGP"
                    }
                }
            });
        }
    };

    const closeServiceModal = () => {
        setServiceModalOpen(false);
        setSelectedService(null);
        // Reset SEO to default
        setSeoData({
            title: "كلين ماستر - رائد خدمات التنظيف في مصر ✨",
            description: appData.company_info.description_ar,
            keywords: ["شركة تنظيف", "تنظيف منازل", "غسيل سجاد", "كلين ماستر"],
            schema: undefined
        });
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
            <SEO 
                title={seoData.title}
                description={seoData.description}
                keywords={seoData.keywords}
                schema={seoData.schema}
            />
            <Hero />
            <ServicesSection onServiceClick={openServiceModal} />
            <StatsSection />
            <WhyUsSection />
            <TestimonialsSection />
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
