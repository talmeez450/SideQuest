import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Scroll } from 'lucide-react';

import { UserAvatar } from './UserAvatar';
import { AuthContext } from '../context/AuthContext';

export const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    
    return (
        <nav className="bg-[#2a1d12] text-amber-50 shadow-[0_4px_12px_rgba(0,0,0,0.5)] border-b-4 border-double border-amber-900/50 sticky top-0 z-50">
            <div className="w-full px-4 md:px-8 py-3.5 flex justify-between items-center gap-4">
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="bg-amber-900/40 p-1.5 border border-amber-800/50 rounded-sm group-hover:bg-amber-800/60 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] transition-colors">
                        <Scroll className="text-amber-400" size={26} />
                    </div>
                    <span className="text-2xl font-black tracking-widest uppercase text-amber-100 group-hover:text-amber-300 drop-shadow-md transition-colors">SideQuest</span>
                </Link>

                <div>
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center gap-2">
                                <UserAvatar src={user.avatarUrl} size={32} className="border-2 border-amber-400/50 shadow-sm" />
                                <span className="text-xs text-amber-200/70 italic hidden lg:block">Hail, <span className="text-amber-400 font-bold not-italic">{user.fullName}</span></span>
                            </div>
                            <button onClick={logout} title="Depart" className="p-2 bg-red-950 hover:bg-red-900 text-red-100 border border-red-900/50 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] transition-all hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none cursor-pointer">
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-x-4 flex items-center">
                            <Link to="/login" className="text-sm text-amber-200/80 hover:text-amber-400 font-bold uppercase tracking-wider">Enter Tavern</Link>
                            <Link to="/register" className="text-sm bg-amber-800 hover:bg-amber-700 text-amber-50 px-5 py-2 border border-amber-950 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5 transition-all font-bold uppercase tracking-wider">Join Guild</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
