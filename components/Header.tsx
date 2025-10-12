import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavClick = (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const [pathname, hash] = path.split('#');

        const scrollToHash = (hashId: string) => {
            const element = document.getElementById(hashId);
            if (element) {
                const headerOffset = 80;
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        };

        // If already on the homepage and there's a hash, just scroll
        if (location.pathname === '/' && hash) {
            scrollToHash(hash);
        } else if (hash) {
            // If on a different page, navigate to home first, then scroll
            navigate('/');
            // Use timeout to allow the page to change before scrolling
            setTimeout(() => scrollToHash(hash), 100);
        } else {
             // If it's a regular path with no hash (like /orders), just navigate
            navigate(pathname || path);
        }

        setMobileMenuOpen(false);
    };

    // This effect handles scrolling if the user lands directly on a URL with a hash
    useEffect(() => {
        if (location.pathname === '/' && location.hash) {
            const hashId = location.hash.substring(1);
            // Use timeout to ensure the element is rendered
            setTimeout(() => {
                const element = document.getElementById(hashId);
                if (element) {
                    const headerOffset = 80;
                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [location.pathname, location.hash]);


    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    const navLinks = [
        { path: "/#home", name: "الرئيسية" },
        { path: "/#services", name: "خدماتنا" },
        { path: "/orders", name: "طلباتي" },
        { path: "/#contact", name: "اتصل بنا" },
    ];

    const mobileNavLinks = [
        { path: "/#home", name: "الرئيسية", icon: "fas fa-home" },
        { path: "/#services", name: "خدماتنا", icon: "fas fa-broom" },
        { path: "/orders", name: "طلباتي", icon: "fas fa-list-alt" },
        { path: "/admin", name: "الإدارة", icon: "fas fa-cog" },
        { path: "/#contact", name: "اتصل بنا", icon: "fas fa-phone" },
    ];

    return (
        <header className="bg-[#FCFCF9] shadow-sm fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-[70px]">
                    <NavLink to="/" className="flex items-center gap-2 text-[#21808D] no-underline">
                        <i className="fas fa-sparkles text-2xl"></i>
                        <span className="text-xl font-bold">كلين ماستر</span>
                    </NavLink>

                    <nav className="hidden md:flex items-center">
                        <ul className="flex list-none m-0 p-0 gap-6">
                            {navLinks.map(link => (
                                <li key={link.path}>
                                    <a href={link.path} onClick={handleNavClick(link.path)} className="text-[#13343B] no-underline font-medium p-3 rounded-lg transition-all duration-200 hover:text-[#21808D] hover:bg-[#5E5240]/[0.12]">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="flex items-center gap-4">
                        <a href="tel:01013373634" className="hidden md:inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#21808D] text-white transition-colors hover:bg-[#1D7480] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#21808D]/50">
                            <i className="fas fa-phone"></i>
                            اتصل بنا
                        </a>
                        <button className="md:hidden flex flex-col justify-center items-center w-8 h-8 bg-transparent border-none cursor-pointer z-50" onClick={toggleMobileMenu}>
                            <span className={`block w-6 h-0.5 bg-[#13343B] rounded-full transition-transform duration-300 ${isMobileMenuOpen ? 'transform rotate-45 translate-y-1.5' : ''}`}></span>
                            <span className={`block w-6 h-0.5 bg-[#13343B] rounded-full my-1 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block w-6 h-0.5 bg-[#13343B] rounded-full transition-transform duration-300 ${isMobileMenuOpen ? 'transform -rotate-45 -translate-y-1.5' : ''}`}></span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <nav className={`fixed top-0 left-0 w-full h-full z-40 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm" onClick={toggleMobileMenu}></div>
                <div className={`absolute top-0 right-0 w-[calc(100%-60px)] max-w-sm h-full bg-[#FCFCF9] shadow-lg transition-transform duration-300 flex flex-col ${isMobileMenuOpen ? 'transform translate-x-0' : 'transform translate-x-full'}`}>
                    <div className="flex items-center justify-between p-5 border-b border-[#5E5240]/[0.2]">
                        <div className="flex items-center gap-2 text-[#21808D] no-underline">
                            <i className="fas fa-sparkles text-2xl"></i>
                            <span className="text-xl font-bold">كلين ماستر</span>
                        </div>
                    </div>
                    <ul className="list-none p-0 m-0 flex-grow">
                        {mobileNavLinks.map(link => (
                            <li key={link.path}>
                                <a href={link.path} onClick={handleNavClick(link.path)} className="flex items-center gap-3 p-4 text-[#13343B] no-underline font-medium transition-all duration-200 border-b border-[#5E5240]/[0.12] hover:bg-[#5E5240]/[0.12] hover:text-[#21808D]">
                                    <i className={`${link.icon} text-[#21808D] w-5 text-center`}></i>
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="p-5 border-t border-[#5E5240]/[0.2] flex flex-col gap-3">
                        <a href="tel:01013373634" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-[#21808D] text-white transition-colors hover:bg-[#1D7480]">
                            <i className="fas fa-phone"></i>
                            اتصل بنا الآن
                        </a>
                        <a href={`https://wa.me/201013373634`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium border border-[#5E5240]/[0.2] text-[#13343B] transition-colors hover:bg-[#5E5240]/[0.12]">
                            <i className="fab fa-whatsapp"></i>
                            واتساب
                        </a>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;