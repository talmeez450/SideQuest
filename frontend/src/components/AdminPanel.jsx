import axios from 'axios';
import { CheckSquare, Coins, ShieldAlert, ShieldBan, ShieldCheck, Users, X, XCircle } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { checkKycVerified } from "../App";
import { UserAvatar } from './UserAvatar';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminPanel = () => {
    const { user, token } = useContext(AuthContext);
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('kyc');
    const [stats, setStats] = useState({ totalUsers: 0, totalGold: 0, completedQuests: 0 });
    const [pendingUsers, setPendingUsers] = useState([]);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null); 
    const [userToRevoke, setUserToRevoke] = useState(null);

    if (!user?.isAdmin) return <Navigate to="/" />;

    const fetchAdminData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [statsRes, kycRes, membersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/stats', config),
                axios.get('http://localhost:5000/api/admin/kyc/pending', config),
                axios.get('http://localhost:5000/api/admin/members', config)
            ]);
            
            setStats(statsRes.data.data);
            setPendingUsers(kycRes.data.data.filter(u => u.CnicFrontUrl && u.CnicFrontUrl.trim() !== ''));
            setMembers(membersRes.data.data);
        } catch (error) { console.error("Failed to fetch Admin powers"); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchAdminData(); }, [token]);

    const handleResolve = async (userId, action) => {
        try {
            const res = await axios.patch(`http://localhost:5000/api/admin/kyc/${userId}`, { action }, { headers: { Authorization: `Bearer ${token}` } });
            showToast(res.data.message, action === 'Approve' ? 'success' : 'error');
            setPendingUsers(prev => prev.filter(u => u.UserID !== userId));
            fetchAdminData();
        } catch (error) { showToast(error.response?.data?.message || `Failed to ${action} KYC.`, 'error'); }
    };

    const handleToggleSuspend = async (userId) => {
        try {
            const res = await axios.patch(`http://localhost:5000/api/admin/members/${userId}/suspend`, {}, { headers: { Authorization: `Bearer ${token}` } });
            showToast(res.data.message, 'success');
            setMembers(members.map(m => m.UserID === userId ? { ...m, IsSuspended: !m.IsSuspended } : m));
        } catch (error) { showToast(error.response?.data?.message || 'Failed to wield Ban Hammer.', 'error'); }
    };

    const confirmRevokeKyc = async () => {
        if (!userToRevoke) return;
        try {
            const res = await axios.patch(`http://localhost:5000/api/admin/members/${userToRevoke}/revoke-kyc`, {}, { headers: { Authorization: `Bearer ${token}` } });
            showToast(res.data.message, 'success');
            fetchAdminData();
        } catch (error) { 
            showToast(error.response?.data?.message || 'Failed to revoke KYC.', 'error'); 
        } finally {
            setUserToRevoke(null);
        }
    };

    return (
        <div className="py-8 animate-fade-in max-w-5xl mx-auto">
            <h1 className="text-4xl font-black text-amber-100 mb-8 tracking-widest uppercase flex items-center gap-3">
                <ShieldCheck className="text-red-500" size={36} /> Grandmaster Panel
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#fdf6e3] p-5 border-4 border-double border-amber-900 shadow-[6px_6px_0px_rgba(0,0,0,0.6)] flex items-center gap-4">
                    <div className="bg-amber-200 p-3 rounded-full border-2 border-amber-500"><Users size={28} className="text-amber-800" /></div>
                    <div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-900/60">Registered Adventurers</p><p className="text-3xl font-black text-amber-950">{stats.totalUsers}</p></div>
                </div>
                <div className="bg-[#fdf6e3] p-5 border-4 border-double border-amber-900 shadow-[6px_6px_0px_rgba(0,0,0,0.6)] flex items-center gap-4">
                    <div className="bg-yellow-200 p-3 rounded-full border-2 border-yellow-500"><Coins size={28} className="text-yellow-800" /></div>
                    <div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-900/60">Total Economy Gold</p><p className="text-3xl font-black text-amber-950">{stats.totalGold} G</p></div>
                </div>
                <div className="bg-[#fdf6e3] p-5 border-4 border-double border-amber-900 shadow-[6px_6px_0px_rgba(0,0,0,0.6)] flex items-center gap-4">
                    <div className="bg-emerald-200 p-3 rounded-full border-2 border-emerald-500"><CheckSquare size={28} className="text-emerald-800" /></div>
                    <div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-900/60">Quests Completed</p><p className="text-3xl font-black text-amber-950">{stats.completedQuests}</p></div>
                </div>
            </div>

            <div className="bg-[#fdf6e3] p-8 relative shadow-[16px_16px_0px_rgba(0,0,0,0.6)] border-4 border-double border-red-900">
                <div className="flex gap-4 mb-6 border-b-2 border-red-900/20 pb-4">
                    <button onClick={() => setActiveTab('kyc')} className={`px-6 py-2 font-bold uppercase tracking-wider text-sm transition-all border-2 border-red-900/50 cursor-pointer ${activeTab === 'kyc' ? 'bg-red-900 text-red-100 shadow-inner' : 'bg-red-100 text-red-900 hover:bg-red-200'}`}>KYC Queue ({pendingUsers.length})</button>
                    <button onClick={() => setActiveTab('members')} className={`px-6 py-2 font-bold uppercase tracking-wider text-sm transition-all border-2 border-red-900/50 cursor-pointer ${activeTab === 'members' ? 'bg-red-900 text-red-100 shadow-inner' : 'bg-red-100 text-red-900 hover:bg-red-200'}`}>Guild Members ({members.length})</button>
                </div>
                
                {isLoading ? (
                    <div className="text-center py-10 text-amber-800 font-bold animate-pulse">Consulting the Archives...</div>
                ) : activeTab === 'kyc' ? (
                    pendingUsers.length === 0 ? (
                        <div className="text-center py-12 text-amber-800/60 italic font-medium bg-amber-50 border-2 border-dashed border-red-900/20">The queue is empty. All adventurers are processed!</div>
                    ) : (
                        <div className="space-y-6">
                            {pendingUsers.map(app => (
                                <div key={app.UserID} className="p-5 border-2 border-red-900/30 bg-amber-50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1 font-sans text-amber-950">
                                        <h4 className="font-black text-lg uppercase tracking-wider">{app.FullName}</h4>
                                        <p className="text-sm font-medium">Email: <span className="text-amber-800">{app.Email}</span></p>
                                        <p className="text-sm font-medium">CNIC: <span className="text-amber-800">{app.CnicNumber}</span></p>
                                        <div className="flex gap-4 mt-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Front</span>
                                                <img src={app.CnicFrontUrl} alt="CNIC Front" onClick={() => setSelectedImage(app.CnicFrontUrl)} className="h-20 w-32 object-cover border-2 border-amber-900/30 rounded cursor-pointer hover:opacity-80 transition-opacity" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Back</span>
                                                <img src={app.CnicBackUrl} alt="CNIC Back" onClick={() => setSelectedImage(app.CnicBackUrl)} className="h-20 w-32 object-cover border-2 border-amber-900/30 rounded cursor-pointer hover:opacity-80 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                        <button onClick={() => handleResolve(app.UserID, 'Approve')} className="flex-1 md:flex-none px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase tracking-wider text-xs border-2 border-emerald-950 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] transition-all cursor-pointer flex justify-center items-center gap-2"><ShieldCheck size={16} /> Approve</button>
                                        <button onClick={() => handleResolve(app.UserID, 'Reject')} className="flex-1 md:flex-none px-6 py-2 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-wider text-xs border-2 border-red-950 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] transition-all cursor-pointer flex justify-center items-center gap-2"><XCircle size={16} /> Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="space-y-4">
                        {members.map(m => (
                            <div key={m.UserID} className={`p-4 border-2 shadow-sm flex justify-between items-center transition-colors ${m.IsSuspended ? 'bg-red-100 border-red-400' : 'bg-amber-50 border-amber-900/30'}`}>
                                <div className="flex items-center gap-4">
                                    <UserAvatar src={m.AvatarUrl} size={40} className="border-2 border-amber-900/50 shadow-sm" />
                                    <div>
                                        <h4 className="font-bold text-amber-950 flex items-center gap-2 text-lg">
                                            {m.FullName} 
                                            {checkKycVerified(m.IsKycVerified) ? <ShieldCheck size={16} className="text-blue-600" title="Tier 1 KYC Verified"/> : null}
                                            {m.IsSuspended ? <span className="bg-red-600 text-red-50 text-[10px] px-2 py-0.5 uppercase tracking-wider font-black shadow-inner flex items-center gap-1"><ShieldBan size={12}/> Suspended</span> : null}
                                        </h4>
                                        <p className="text-sm font-sans text-amber-800">{m.Email} | Rating: {m.Rating ? parseFloat(m.Rating).toFixed(1) : 'Unrated'}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-2">
                                    {checkKycVerified(m.IsKycVerified) && !m.IsSuspended && (
                                        <button onClick={() => setUserToRevoke(m.UserID)} className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-bold uppercase tracking-wider border-2 border-amber-500 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] transition-all cursor-pointer">Revoke KYC</button>
                                    )}
                                    <button onClick={() => handleToggleSuspend(m.UserID)} className={`px-4 py-2 text-white text-xs font-bold uppercase tracking-wider border-2 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center gap-1 cursor-pointer ${m.IsSuspended ? 'bg-green-700 hover:bg-green-600 border-green-950' : 'bg-red-700 hover:bg-red-600 border-red-950'}`}>
                                        {m.IsSuspended ? 'Pardon' : <><ShieldBan size={14}/> Suspend</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedImage && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-100 flex justify-center items-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-amber-100 hover:text-white cursor-pointer hover:scale-110 transition-transform"><X size={36} /></button>
                        <img src={selectedImage} alt="CNIC Full View" className="w-full h-auto max-h-[85vh] object-contain border-4 border-amber-900/50 shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-sm bg-[#fdf6e3]" />
                    </div>
                </div>
            )}

            {userToRevoke && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-110 flex justify-center items-center p-4">
                    <div className="bg-[#fdf6e3] p-8 max-w-md w-full relative shadow-[16px_16px_0px_rgba(0,0,0,0.8)] border-4 border-double border-red-900 text-center animate-fade-in">
                        <div className="mx-auto bg-amber-200 w-20 h-20 rounded-full flex justify-center items-center border-4 border-amber-900 mb-4 shadow-inner">
                            <ShieldAlert size={36} className="text-amber-700" />
                        </div>
                        <h2 className="text-3xl font-black text-red-950 mb-2 uppercase tracking-widest">Revoke Royal Seal?</h2>
                        <p className="text-amber-950 font-medium mb-8 text-sm">
                            Are you certain you wish to strip this adventurer of their Tier 1 KYC status? They will need to re-apply to post bounties!
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setUserToRevoke(null)} className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold py-3 border-2 border-slate-500 uppercase tracking-widest transition-colors cursor-pointer">
                                Nevermind
                            </button>
                            <button onClick={confirmRevokeKyc} className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-3 border-2 border-red-950 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all uppercase tracking-widest cursor-pointer">
                                Yes, Revoke!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
