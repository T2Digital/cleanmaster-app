
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';

const AdminFloatingButton: React.FC = () => {
    const appContext = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Only show if admin is logged in
    if (!appContext?.isAdminLoggedIn) {
        return null;
    }

    // Hide if already on admin page
    if (location.pathname === '/admin') {
        return null;
    }

    const handleClick = () => {
        navigate('/admin');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-[9989] w-14 h-14 bg-[#13343B] text-white rounded-full shadow-lg border-2 border-[#21808D] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(33,128,141,0.5)] group"
            title="لوحة تحكم الإدارة"
        >
            <i className="fas fa-user-shield text-xl group-hover:rotate-12 transition-transform"></i>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
        </button>
    );
};

export default AdminFloatingButton;
