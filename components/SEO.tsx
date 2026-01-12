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
    title = "كلين ماستر | شركة تنظيف منازل ومفروشات معتمدة في مصر",
    description = "أفضل شركة تنظيف في القاهرة والجيزة. نقدم خدمات غسيل السجاد بالبخار، تنظيف الانتريهات، تنظيف الفلل، وجلي الرخام بأحدث الأجهزة.",
    keywords = ["شركة تنظيف", "نظافة منازل", "كلين ماستر", "تنظيف سجاد", "تنظيف انتريه بالبخار", "شركة تنظيف التجمع"],
    image = "https://i.ibb.co/f52dPHc/1000049048.jpg",
    url = "https://cleanmaster-lac.vercel.app/",
    type = "website",
    schema
}) => {
    
    useEffect(() => {
        document.title = title;

        const setMeta = (selector: string, content: string) => {
            let element = document.querySelector(selector);
            if (!element) {
                const meta = document.createElement('meta');
                if (selector.startsWith('meta[name=')) meta.setAttribute('name', selector.replace('meta[name="', '').replace('"]', ''));
                else if (selector.startsWith('meta[property=')) meta.setAttribute('property', selector.replace('meta[property="', '').replace('"]', ''));
                meta.setAttribute('content', content);
                document.head.appendChild(meta);
            } else { element.setAttribute('content', content); }
        };

        setMeta('meta[name="description"]', description);
        setMeta('meta[name="keywords"]', keywords.join(", "));
        setMeta('meta[property="og:title"]', title);
        setMeta('meta[property="og:image"]', image);
        setMeta('meta[property="og:description"]', description);
        
        // Professional Service Schema (Crucial for Local SEO)
        const professionalSchema = {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "كلين ماستر - Clean Master Egypt",
            "image": image,
            "url": url,
            "telephone": appData.company_info.phone,
            "priceRange": "$$",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "التجمع الخامس",
                "addressLocality": "القاهرة",
                "addressCountry": "EG"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 30.0444,
                "longitude": 31.2357
            },
            "servesCuisine": "Cleaning Services",
            "areaServed": ["القاهرة", "الجيزة", "التجمع", "الشيخ زايد", "مدينتي"],
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "1250"
            }
        };

        const finalSchema = schema ? { ...professionalSchema, ...schema } : professionalSchema;
        
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