import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Camera, ShieldAlert, ShieldCheck, ShieldQuestion, User } from 'lucide-react';

import { checkKycVerified } from "../App";
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Profile = () => {
    const { user, token, login } = useContext(AuthContext);
    const { showToast } = useToast();
    const [kycForm, setKycForm] = useState({ cnicFrontUrl: '', cnicBackUrl: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [liveStatus, setLiveStatus] = useState(user?.kycStatus || 'None');

    useEffect(() => {
        const fetchTrueIdentity = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5000/api/users/me', config);
                const fetchedData = res.data.data;
                
                setLiveStatus(fetchedData.KycStatus);
                
                if (fetchedData.KycStatus !== user?.kycStatus || fetchedData.AvatarUrl !== user?.avatarUrl) {
                    login({ ...user, kycStatus: fetchedData.KycStatus, avatarUrl: fetchedData.AvatarUrl }, token);
                }
            } catch (err) { console.error("Failed to fetch true identity."); }
        };
        fetchTrueIdentity();
    }, [token, user, login]);

    const compressImage = (file, maxWidth, callback) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast("File is too heavy! Must be under 5MB.", "error"); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let scaleSize = img.width > maxWidth ? maxWidth / img.width : 1;
                canvas.width = img.width * scaleSize;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                callback(canvas.toDataURL('image/jpeg', 0.8));
            };
        };
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = (e) => {
        compressImage(e.target.files[0], 400, async (base64) => {
            try {
                const res = await axios.post('http://localhost:5000/api/users/avatar', { avatarUrl: base64 }, { headers: { Authorization: `Bearer ${token}` } });
                showToast(res.data.message, 'success');
                login({ ...user, avatarUrl: base64 }, token);
            } catch (err) { showToast('Failed to update magical portrait.', 'error'); }
        });
    };

    const handleKycSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post('http://localhost:5000/api/users/kyc', kycForm, config);
            showToast(res.data.message, 'success');
            setLiveStatus('Pending');
            login({ ...user, kycStatus: 'Pending' }, token); 
        } catch (error) { showToast(error.response?.data?.message || 'Failed to submit KYC.', 'error'); } 
        finally { setIsLoading(false); }
    };

    return (
        <div className="py-8 animate-fade-in max-w-3xl mx-auto">
            <h1 className="text-4xl font-black text-amber-100 mb-8 tracking-widest uppercase flex items-center gap-3">
                <User className="text-amber-500" size={36} /> Adventurer Profile
            </h1>

            <div className="bg-[#fdf6e3] p-8 border-4 border-double border-amber-900 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] mb-8 flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-amber-900 overflow-hidden bg-amber-200 flex justify-center items-center shadow-inner">
                        {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Profile" /> : <User size={64} className="text-amber-800/50" />}
                    </div>
                    <label className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col justify-center items-center text-amber-100 cursor-pointer rounded-full font-bold uppercase tracking-wider text-xs transition-all">
                        <Camera size={24} className="mb-1 text-amber-400" />
                        Portrait
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                </div>
                
                <div className="flex-1 w-full">
                    <h2 className="text-2xl font-black text-amber-950 mb-4 uppercase tracking-widest border-b-2 border-amber-900/20 pb-2">Guild Identity</h2>
                    <div className="grid grid-cols-2 gap-4 font-sans text-amber-900 font-medium">
                        <p><span className="font-bold text-amber-950 uppercase tracking-wider text-xs">Name:</span><br/> {user?.fullName}</p>
                        <p><span className="font-bold text-amber-950 uppercase tracking-wider text-xs">Email:</span><br/> {user?.email}</p>
                        <p><span className="font-bold text-amber-950 uppercase tracking-wider text-xs">Reputation:</span><br/> {user?.rating ? `${parseFloat(user.rating).toFixed(1)} / 5.0 Stars` : 'Unrated'}</p>
                        <p><span className="font-bold text-amber-950 uppercase tracking-wider text-xs">Rank:</span><br/> {user?.isAdmin ? 'Grandmaster (Admin)' : 'Adventurer'}</p>
                    </div>
                </div>
            </div>

            <div className={`p-8 border-4 border-double shadow-[8px_8px_0px_rgba(0,0,0,0.6)] ${liveStatus === 'Approved' ? 'bg-emerald-50 border-emerald-900' : 'bg-[#fdf6e3] border-amber-900'}`}>
                <h2 className="text-2xl font-black text-amber-950 mb-4 uppercase tracking-widest border-b-2 border-amber-900/20 pb-2 flex items-center gap-2">
                    {liveStatus === 'Approved' ? <ShieldCheck className="text-emerald-600" /> : <ShieldAlert className="text-amber-600" />}
                    Tier 1 KYC Status
                </h2>

                {liveStatus === 'Approved' ? (
                    <div className="text-emerald-800 font-bold flex flex-col items-center py-6 text-center">
                        <ShieldCheck size={64} className="mb-4 text-emerald-600" />
                        <p className="text-xl uppercase tracking-widest">Royal Seal Verified</p>
                        <p className="text-sm font-medium mt-2">You are fully authorized to post bounties and manage escrow.</p>
                    </div>
                ) : liveStatus === 'Pending' ? (
                    <div className="text-amber-800 font-bold flex flex-col items-center py-6 text-center">
                        <ShieldQuestion size={64} className="mb-4 text-amber-600 animate-pulse" />
                        <p className="text-xl uppercase tracking-widest">Awaiting Judgment</p>
                        <p className="text-sm font-medium mt-2">The High Council is reviewing your documents. Please be patient.</p>
                    </div>
                ) : (
                    <div>
                        <div className="bg-red-100 border border-red-400 text-red-800 p-4 mb-6 text-sm font-medium">
                            {liveStatus === 'Rejected' ? "Your previous application was rejected. Please provide clearer documents." : "You must provide your Royal Seal (CNIC) to prove your identity."}
                        </div>
                        <form onSubmit={handleKycSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">CNIC Front Image</label>
                                <input type="file" accept="image/*" required onChange={e => compressImage(e.target.files[0], 800, (b64) => setKycForm({...kycForm, cnicFrontUrl: b64}))} className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none font-sans file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-amber-900 file:text-amber-50 hover:file:bg-amber-800 cursor-pointer transition-colors" />
                                {kycForm.cnicFrontUrl && <img src={kycForm.cnicFrontUrl} alt="Front Preview" className="mt-2 h-24 object-cover border-2 border-amber-900/30 rounded shadow-inner" />}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">CNIC Back Image</label>
                                <input type="file" accept="image/*" required onChange={e => compressImage(e.target.files[0], 800, (b64) => setKycForm({...kycForm, cnicBackUrl: b64}))} className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none font-sans file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-amber-900 file:text-amber-50 hover:file:bg-amber-800 cursor-pointer transition-colors" />
                                {kycForm.cnicBackUrl && <img src={kycForm.cnicBackUrl} alt="Back Preview" className="mt-2 h-24 object-cover border-2 border-amber-900/30 rounded shadow-inner" />}
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-amber-900 hover:bg-amber-950 text-[#fdf6e3] font-bold py-3 border-2 border-amber-950 shadow-[4px_4px_0px_rgba(69,26,3,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all uppercase tracking-widest mt-4 disabled:opacity-50 cursor-pointer">
                                {isLoading ? 'Sending to Council...' : 'Upload Documents'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
