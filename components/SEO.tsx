import React, { useEffect } from 'react';
import { appData } from '../constants';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: string;
    schema?: object;
}

const SEO: React.FC<SEOProps> = ({ 
    title = "كلين ماستر - رائد خدمات التنظيف في مصر",
    description = appData.company_info.description_ar,
    keywords = ["شركة تنظيف", "نظافة منازل", "كلين ماستر", "تنظيف سجاد", "تنظيف انتريه"],
    image = "https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=80&w=1200",
    url = "https://cleanmaster.com.eg/",
    type = "website",
    schema
}) => {
    
    useEffect(() => {
        // Update Title
        document.title = title;

        // Helper to update or create meta tags
        const setMeta = (selector: string, content: string) => {
            let element = document.querySelector(selector);
            if (!element) {
                const meta = document.createElement('meta');
                if (selector.startsWith('meta[name=')) {
                    meta.setAttribute('name', selector.replace('meta[name="', '').replace('"]', ''));
                } else if (selector.startsWith('meta[property=')) {
                    meta.setAttribute('property', selector.replace('meta[property="', '').replace('"]', ''));
                }
                meta.setAttribute('content', content);
                document.head.appendChild(meta);
            } else {
                element.setAttribute('content', content);
            }
        };

        setMeta('meta[name="description"]', description);
        setMeta('meta[name="keywords"]', keywords.join(", "));
        
        setMeta('meta[property="og:title"]', title);
        setMeta('meta[property="og:description"]', description);
        setMeta('meta[property="og:image"]', image);
        setMeta('meta[property="og:url"]', url);
        setMeta('meta[property="og:type"]', type);
        
        setMeta('meta[property="twitter:title"]', title);
        setMeta('meta[property="twitter:description"]', description);
        setMeta('meta[property="twitter:image"]', image);
        setMeta('meta[property="twitter:url"]', url);

        // Schema JSON-LD
        const baseSchema = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": appData.company_info.name_ar,
            "alternateName": appData.company_info.name_en,
            "image": image,
            "telephone": appData.company_info.phone,
            "email": appData.company_info.email,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "القاهرة الجديدة",
                "addressRegion": "القاهرة",
                "addressCountry": "EG"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 30.0444,
                "longitude": 31.2357
            },
            "url": url,
            "priceRange": "$$",
            "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                  ],
                  "opens": "08:00",
                  "closes": "22:00"
                }
            ],
            "sameAs": [
                "https://www.facebook.com/cleanmaster",
                "https://www.instagram.com/cleanmaster",
                `https://wa.me/${appData.company_info.whatsapp}`
            ]
        };

        const finalSchema = schema ? { ...baseSchema, ...schema } : baseSchema;
        
        let script = document.getElementById('json-ld-schema');
        if (!script) {
            script = document.createElement('script');
            script.id = 'json-ld-schema';
            script.setAttribute('type', 'application/ld+json');
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(finalSchema);

    }, [title, description, keywords, image, url, type, schema]);

    return null;
};

export default SEO;