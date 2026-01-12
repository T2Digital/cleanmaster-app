import React, { useState } from 'react';
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
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
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
        { path: "/#home", name: "الرئيسية", icon: "fas fa-home" },
        { path: "/#services", name: "خدماتنا", icon: "fas fa-broom" },
        { path: "/orders", name: "طلباتي", icon: "fas fa-list-alt" },
        { path: "/#contact", name: "اتصل بنا", icon: "fas fa-phone" },
    ];

    return (
        <header className="bg-[#FCFCF9] shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-[75px]">
                    <NavLink to="/" className="flex items-center gap-3 no-underline">
                        <img src="https://i.ibb.co/f52dPHc/1000049048.jpg" alt="Logo" className="h-12 w-auto rounded-full shadow-sm" />
                        <span className="text-xl font-black text-[#21808D]">كلين ماستر</span>
                    </NavLink>

                    <nav className="hidden md:flex items-center">
                        <ul className="flex list-none m-0 p-0 gap-8">
                            {navLinks.map(link => (
                                <li key={link.path}>
                                    <a href={link.path} onClick={handleNavClick(link.path)} className="text-[#13343B] no-underline font-bold text-sm hover:text-[#21808D] transition-all">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="flex items-center gap-4">
                        <a href="tel:01013373634" className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black bg-[#21808D] text-white shadow-md">
                            <i className="fas fa-phone-alt"></i> 01013373634
                        </a>
                        <button className="md:hidden text-[#21808D] text-2xl" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 z-40 transition-all ${isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                <div className={`absolute top-0 right-0 w-64 h-full bg-white shadow-2xl transition-transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6 text-center border-b">
                        <img src="https://i.ibb.co/f52dPHc/1000049048.jpg" className="h-16 mx-auto rounded-full shadow-md mb-2" alt="Logo" />
                        <p className="font-bold text-[#21808D]">كلين ماستر مصر</p>
                    </div>
                    <ul className="list-none p-4 m-0">
                        {navLinks.map(link => (
                            <li key={link.path}>
                                <a href={link.path} onClick={handleNavClick(link.path)} className="flex items-center gap-4 p-4 text-[#13343B] no-underline font-bold rounded-xl hover:bg-gray-50 transition-all border-b border-gray-50 last:border-none">
                                    <i className={`${link.icon} text-[#21808D]/60`}></i> {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default Header;