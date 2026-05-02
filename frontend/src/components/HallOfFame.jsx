import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Star, Trophy } from 'lucide-react';

import { checkKycVerified } from "../App";
import { UserAvatar } from './UserAvatar';
import { AuthContext } from '../context/AuthContext';

export const HallOfFame = () => {
    const { token } = useContext(AuthContext);
    const [leaders, setLeaders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/leaderboard', { headers: { Authorization: `Bearer ${token}` } });
                setLeaders(res.data.data);
            } catch (e) { console.error("Failed to load heroes"); } 
            finally { setIsLoading(false); }
        };
        fetchLeaders();
    }, [token]);

    return (
        <div className="py-8 animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-amber-100 mb-8 tracking-widest uppercase flex items-center gap-3"><Trophy className="text-yellow-400" size={36} /> Hall of Fame</h1>
            <div className="bg-[#fdf6e3] p-8 border-4 border-double border-amber-900 shadow-[8px_8px_0px_rgba(0,0,0,0.6)]">
                {isLoading ? (
                    <div className="text-center py-10 text-amber-800 font-bold animate-pulse">Consulting the Oracles...</div>
                ) : leaders.length === 0 ? (
                    <div className="text-center py-12 text-amber-800/60 italic font-medium border-2 border-dashed border-amber-900/20">The hall is empty. No heroes have been written into legend yet.</div>
                ) : (
                    <div className="space-y-4">
                        {leaders.map((leader, index) => (
                            <div key={leader.UserID} className="flex items-center justify-between p-4 border-2 border-amber-900/30 bg-amber-50 hover:bg-amber-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 flex items-center justify-center font-black text-xl border-2 ${index === 0 ? 'bg-yellow-400 text-yellow-900 border-yellow-600 shadow-sm' : index === 1 ? 'bg-gray-300 text-gray-800 border-gray-500 shadow-sm' : index === 2 ? 'bg-amber-700 text-amber-100 border-amber-900 shadow-sm' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>#{index + 1}</div>
                                    <UserAvatar src={leader.AvatarUrl} size={48} className="border-2 border-amber-900/30 shadow-sm" />
                                    <div>
                                        <h3 className="font-black text-amber-950 uppercase tracking-widest text-lg flex items-center gap-2">
                                            {leader.FullName}
                                            {checkKycVerified(leader.IsKycVerified) ? <ShieldCheck size={16} className="text-blue-600" title="Tier 1 KYC Verified"/> : null}
                                        </h3>
                                        <p className="text-sm font-bold text-amber-800/70">{leader.QuestsCompleted} Quests Completed</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-yellow-600 justify-end"><Star size={16} className="fill-current" /><span className="font-black text-xl">{parseFloat(leader.Rating).toFixed(1)}</span></div>
                                    <p className="text-[10px] uppercase font-bold text-amber-900/50 tracking-wider">{leader.TotalRatingsCount} Reviews</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
