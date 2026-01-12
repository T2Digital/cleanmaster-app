
// Fix: Added React import to resolve 'Cannot find namespace React' errors
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

        if (location.pathname === '/' && hash) {
            scrollToHash(hash);
        } else if (hash) {
            navigate('/');
            setTimeout(() => scrollToHash(hash), 100);
        } else {
            navigate(pathname || path);
        }

        setMobileMenuOpen(false);
    };

    const navLinks = [
        { path: "/#home", name: "الرئيسية" },
        { path: "/#services", name: "خدماتنا" },
        { path: "/orders", name: "طلباتي" },
        { path: "/#contact", name: "اتصل بنا" },
    ];

    // Admin link removed from mobile menu for security/cleanliness
    const mobileNavLinks = [
        { path: "/#home", name: "الرئيسية", icon: "fas fa-home" },
        { path: "/#services", name: "خدماتنا", icon: "fas fa-broom" },
        { path: "/orders", name: "طلباتي", icon: "fas fa-list-alt" },
        { path: "/#contact", name: "اتصل بنا", icon: "fas fa-phone" },
    ];

    return (
        <header className="bg-[#FCFCF9] shadow-sm fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-[75px]">
                    <NavLink to="/" className="flex items-center gap-3 no-underline">
                        <img 
                            src="https://i.ibb.co/f52dPHc/1000049048.jpg" 
                            alt="Clean Master Logo" 
                            className="h-14 w-auto object-contain rounded-full shadow-sm"
                        />
                        <div className="flex flex-col leading-tight">
                            <span className="text-xl font-black text-[#21808D]">كلين ماستر</span>
                            <span className="text-[10px] font-bold text-gray-400 hidden sm:block">CLEAN MASTER EGYPT</span>
                        </div>
                    </NavLink>

                    <nav className="hidden md:flex items-center">
                        <ul className="flex list-none m-0 p-0 gap-8">
                            {navLinks.map(link => (
                                <li key={link.path}>
                                    <a href={link.path} onClick={handleNavClick(link.path)} className="text-[#13343B] no-underline font-bold text-sm transition-all duration-200 hover:text-[#21808D] relative group">
                                        {link.name}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#21808D] transition-all group-hover:w-full"></span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="flex items-center gap-4">
                        <a href="tel:01013373634" className="hidden md:inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-black bg-[#21808D] text-white transition-all hover:bg-[#1D7480] shadow-md hover:shadow-lg active:scale-95">
                            <i className="fas fa-phone-alt"></i>
                            01013373634
                        </a>
                        <button className="md:hidden flex flex-col justify-center items-center w-10 h-10 bg-gray-50 rounded-xl cursor-pointer" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-[#21808D] text-xl`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <div className={`fixed inset-0 z-40 transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                <div className={`absolute top-0 right-0 w-72 h-full bg-white shadow-2xl transition-transform duration-500 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6 border-b border-gray-100 flex items-center justify-center">
                        <img src="https://i.ibb.co/f52dPHc/1000049048.jpg" className="h-20 w-auto rounded-full shadow-md" alt="Logo" />
                    </div>
                    <ul className="list-none p-4 m-0">
                        {mobileNavLinks.map(link => (
                            <li key={link.path}>
                                <a href={link.path} onClick={handleNavClick(link.path)} className="flex items-center gap-4 p-4 text-[#13343B] no-underline font-bold rounded-xl mb-1 hover:bg-[#F0F9FA] hover:text-[#21808D] transition-all">
                                    <i className={`${link.icon} w-6 text-center opacity-70`}></i>
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="absolute bottom-8 left-0 w-full px-6 flex flex-col gap-3">
                         <a href="tel:01013373634" className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-bold bg-[#21808D] text-white shadow-lg">
                            <i className="fas fa-phone-alt"></i> اتصل بنا
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
