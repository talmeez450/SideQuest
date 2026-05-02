import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, Briefcase, Search, ShieldCheck, Trophy, User, Users, Wallet as WalletIcon } from 'lucide-react';

import { AuthContext } from '../context/AuthContext';

export const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    if (!user) return null;

    const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    
    const navLinks = [
        { path: '/', exact: true, label: 'Board', icon: <Search size={20} /> },
        { path: '/my-gigs', exact: false, label: 'My Gigs', icon: <Briefcase size={20} /> },
        { path: '/manage', exact: false, label: 'My Posted', icon: <Users size={20} /> },
        { path: '/saved', exact: false, label: 'Saved', icon: <Bookmark size={20} /> },
        { path: '/wallet', exact: false, label: 'Vault', icon: <WalletIcon size={20} /> },
        { path: '/hall-of-fame', exact: false, label: 'Heroes', icon: <Trophy size={20} /> },
        { path: '/profile', exact: false, label: 'Profile', icon: <User size={20} /> }
    ];

    if (user?.isAdmin) {
        navLinks.push({ path: '/admin', exact: false, label: 'Admin', icon: <ShieldCheck size={20} className="text-red-400" /> });
    }

    return (
        <>
            <aside className="hidden md:flex flex-col w-64 bg-[#2a1d12] border-r-4 border-double border-amber-900/50 shrink-0 h-full overflow-y-auto custom-scrollbar shadow-2xl">
                <div className="p-4 space-y-2 mt-4">
                    {navLinks.map(link => (
                        <Link 
                            key={link.path} to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider border-2 transition-all ${
                                (link.exact ? location.pathname === link.path : isActive(link.path)) 
                                ? 'bg-amber-900 text-amber-100 border-amber-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]' 
                                : 'border-transparent text-amber-500 hover:bg-amber-900/40 hover:border-amber-900/50 hover:text-amber-300'
                            }`}
                        >
                            {link.icon} <span className="text-sm">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </aside>
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#2a1d12] border-t-4 border-double border-amber-900/50 flex overflow-x-auto z-50 snap-x hide-scrollbar">
                {navLinks.map(link => (
                    <Link 
                        key={link.path} to={link.path}
                        className={`flex flex-col items-center justify-center shrink-0 min-w-19 px-2 py-3 border-t-2 transition-all snap-start ${
                            (link.exact ? location.pathname === link.path : isActive(link.path)) 
                            ? 'bg-amber-900 text-amber-100 border-amber-500' 
                            : 'border-transparent text-amber-500 hover:bg-amber-900/40'
                        }`}
                    >
                        {link.icon} 
                        <span className="text-[10px] font-black uppercase tracking-wider mt-1">{link.label}</span>
                    </Link>
                ))}
            </div>
        </>
    );
};
