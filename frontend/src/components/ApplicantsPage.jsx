import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Users, XCircle } from 'lucide-react';

import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const ApplicantsPage = () => {
    const { id } = useParams();
    const { token } = useContext(AuthContext);
    const { showToast } = useToast();
    const [applicants, setApplicants] = useState([]);
    const [questTitle, setQuestTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplicantsData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [appRes, questRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/quests/${id}/applicants`, config),
                    axios.get(`http://localhost:5000/api/quests/${id}`, config)
                ]);
                setApplicants(appRes.data.data);
                setQuestTitle(questRes.data.data.Title);
            } catch (error) {
                console.error("Failed to fetch applicants");
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplicantsData();
    }, [id, token]);

    const handleApplicantResponse = async (applicantId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.patch(`http://localhost:5000/api/quests/${id}/applicants/${applicantId}`, { status }, config);
            
            showToast(res.data.message, 'success');
            
            if (status === 'Approved') {
                navigate('/manage'); 
            } else {
                setApplicants(applicants.map(a => a.ApplicantID === applicantId ? { ...a, ApplicationStatus: 'Rejected' } : a));
            }
        } catch (error) {
            showToast(error.response?.data?.message || "Action failed.", 'error');
        }
    };

    if (isLoading) return <div className="text-center py-20 text-amber-500 animate-pulse font-bold text-xl uppercase tracking-widest">Consulting the Waitlist...</div>;

    return (
        <div className="py-8 animate-fade-in max-w-4xl mx-auto">
            <button onClick={() => navigate('/manage')} className="mb-6 flex items-center gap-2 text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest transition-colors">
                <ArrowLeft size={18} /> Back to My Posted Quests
            </button>

            <div className="bg-[#fdf6e3] p-8 relative shadow-[16px_16px_0px_rgba(0,0,0,0.6)] border-4 border-double border-amber-900">
                <h2 className="text-3xl font-black text-amber-950 mb-2 uppercase tracking-widest flex items-center gap-3">
                    <Users className="text-amber-700" size={32} /> Review Applicants
                </h2>
                <p className="text-amber-800 mb-8 font-sans font-medium text-lg border-b-2 border-amber-900/20 pb-4">
                    For: <span className="font-bold text-amber-950">{questTitle}</span>
                </p>
                
                <div className="space-y-4">
                    {applicants.length === 0 ? (
                        <p className="text-center py-12 text-amber-800/60 italic font-medium bg-amber-50 border-2 border-dashed border-amber-900/20">No brave souls have applied yet...</p>
                    ) : (
                        applicants.map(app => (
                            <div key={app.ApplicantID} className={`p-5 border-2 ${app.IsBusy ? 'border-gray-400 bg-gray-200' : 'border-amber-900/30 bg-amber-50'} flex justify-between items-center transition-all`}>
                                <div>
                                    <h4 className="font-bold text-amber-950 text-lg flex items-center gap-2">
                                        {app.FullName}
                                        {app.IsBusy && <span className="text-[10px] bg-gray-400 text-gray-800 px-2 py-0.5 uppercase tracking-wider font-black shadow-inner">Busy with another quest</span>}
                                    </h4>
                                    <p className="text-sm text-amber-800/80 font-sans">{app.Email}</p>
                                </div>
                                {app.ApplicationStatus === 'Pending' && !app.IsBusy && (
                                    <div className="flex gap-3">
                                        <button onClick={() => handleApplicantResponse(app.ApplicantID, 'Approved')} className="px-4 py-2 bg-green-600 text-white font-bold uppercase tracking-wider text-xs border-2 border-green-900 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5 transition-all flex items-center gap-2 cursor-pointer" title="Hire Them!">
                                            <CheckCircle size={16} /> Hire
                                        </button>
                                        <button onClick={() => handleApplicantResponse(app.ApplicantID, 'Rejected')} className="px-4 py-2 bg-red-600 text-white font-bold uppercase tracking-wider text-xs border-2 border-red-900 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5 transition-all flex items-center gap-2 cursor-pointer" title="Reject">
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </div>
                                )}
                                {app.ApplicationStatus !== 'Pending' && (
                                    <span className={`text-sm font-black uppercase tracking-wider px-3 py-1 border ${app.ApplicationStatus === 'Approved' ? 'bg-green-100 text-green-800 border-green-400' : 'bg-red-100 text-red-800 border-red-400'}`}>
                                        {app.ApplicationStatus}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
