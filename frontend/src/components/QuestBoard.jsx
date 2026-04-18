import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bookmark, BookmarkCheck, Briefcase, CheckSquare, Clock, Coins, Edit2, Info, Lock, MapPin, PlayCircle, PlusCircle, Save, Search, ShieldCheck, Trash2, User, Users, Wand2, X } from 'lucide-react';

import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const QuestBoard = ({ filterType }) => {
    const { token, user } = useContext(AuthContext);
    const { showToast } = useToast();
    const [quests, setQuests] = useState([]);
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [boardCategory, setBoardCategory] = useState('All'); 
    
    const [myGigsCategory, setMyGigsCategory] = useState('InProgress'); // 'Pending', 'InProgress', 'Completed'

    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [newQuest, setNewQuest] = useState({ title: '', description: '', questType: 'Errand', rewardAmount: '', location: '', expiresAt: '' });

    const [selectedQuest, setSelectedQuest] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', location: '', expiresAt: '' });

    const [questToDelete, setQuestToDelete] = useState(null);

    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const today = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];

    const getFutureDate = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        const offset = d.getTimezoneOffset() * 60000;
        return (new Date(d.getTime() - offset)).toISOString().split('T')[0];
    };

    const quickCastTemplates = [
        { title: "Need +1 for Futsal", type: "Social", reward: 0, location: "Local Arena", expiresAt: getFutureDate(1) },
        { title: "Courier Needed", type: "Errand", reward: 300, location: "Market District", expiresAt: getFutureDate(3) }
    ];

    const applyTemplate = (template) => {
        setNewQuest({
            ...newQuest,
            title: template.title,
            questType: template.type,
            rewardAmount: template.reward,
            location: template.location,
            expiresAt: template.expiresAt
        });
    };

    const fetchQuests = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let endpoint = 'http://localhost:5000/api/quests';
            
            if (filterType === 'Saved') endpoint = 'http://localhost:5000/api/quests/saved';
            else if (filterType === 'MyGigs') endpoint = 'http://localhost:5000/api/quests/my-gigs';
            else if (filterType === 'Manage') endpoint = 'http://localhost:5000/api/quests/manage';
            else if (boardCategory !== 'All') endpoint += `?type=${boardCategory}`;

            const res = await axios.get(endpoint, config);
            setQuests(res.data.data);

            if (filterType === 'Board') {
                const savedRes = await axios.get('http://localhost:5000/api/quests/saved', config);
                setBookmarkedIds(new Set(savedRes.data.data.map(q => q.QuestID)));
            } else if (filterType === 'Saved') {
                setBookmarkedIds(new Set(res.data.data.map(q => q.QuestID)));
            }
        } catch (error) {
            console.error("Failed to fetch quests");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchQuests(); }, [filterType, boardCategory, token]);

    const displayedQuests = (() => {
        if (filterType === 'MyGigs') {
            if (myGigsCategory === 'Pending') return quests.filter(q => q.GigState === 'Pending');
            if (myGigsCategory === 'InProgress') return quests.filter(q => q.GigState === 'Hired' && (q.Status === 'Accepted' || q.Status === 'InProgress'));
            if (myGigsCategory === 'Completed') return quests.filter(q => q.GigState === 'Hired' && q.Status === 'Completed');
        }
        return quests;
    })();

    const toggleBookmark = async (questId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(`http://localhost:5000/api/quests/${questId}/bookmark`, {}, config);
            
            setBookmarkedIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(questId)) {
                    newSet.delete(questId);
                } else {
                    newSet.add(questId);
                }
                return newSet;
            });

            if (filterType === 'Saved' && res.data.message.includes('removed')) {
                setQuests(prevQuests => prevQuests.filter(q => q.QuestID !== questId));
            }
        } catch (error) { console.error("Failed to bookmark:", error); }
    };

    const handlePostQuest = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/quests', newQuest, config);
            setIsPostModalOpen(false);
            setNewQuest({ title: '', description: '', questType: 'Errand', rewardAmount: '', location: '', expiresAt: '' });
            fetchQuests();
            showToast("Bounty successfully pinned to the board!", 'success');
        } catch (error) { 
            showToast(error.response?.data?.message || "Failed to post quest.", 'error');
        }
    };

    const handleApply = async (questId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(`http://localhost:5000/api/quests/${questId}/apply`, {}, config);
            showToast(res.data.message, 'success');
            fetchQuests();
        } catch (error) { 
            showToast(error.response?.data?.message || "Failed to apply.", 'error');
        }
    };

    const handleStatusUpdate = async (questId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.patch(`http://localhost:5000/api/quests/${questId}/status`, { newStatus }, config);
            showToast(res.data.message, 'success');
            fetchQuests();
            if (selectedQuest) fetchSingleQuestData(selectedQuest.QuestID);
        } catch (error) { 
            showToast(error.response?.data?.message || "Status update failed.", 'error');
        }
    };

    const handleOpenDetails = async (quest) => {
        setSelectedQuest(quest); 
        setIsEditing(false); 
        setEditForm({
            title: quest.Title,
            description: quest.Description,
            location: quest.Location,
            expiresAt: quest.ExpiresAt ? quest.ExpiresAt.split('T')[0] : ''
        });
        fetchSingleQuestData(quest.QuestID);
    };

    const fetchSingleQuestData = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`http://localhost:5000/api/quests/${id}`, config);
            setSelectedQuest(res.data.data);
        } catch (error) { console.error("Failed to refresh quest details."); }
    };

    const handleUpdateQuest = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(`http://localhost:5000/api/quests/${selectedQuest.QuestID}`, editForm, config);
            showToast(res.data.message, 'success');
            setIsEditing(false);
            fetchSingleQuestData(selectedQuest.QuestID);
            fetchQuests(); 
        } catch (error) { 
            showToast(error.response?.data?.message || "Update failed.", 'error');
        }
    };

    const initiateCancelQuest = (questId) => {
        setQuestToDelete(questId);
    };

    const confirmCancelQuest = async () => {
        if (!questToDelete) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.patch(`http://localhost:5000/api/quests/${questToDelete}/cancel`, {}, config);
            showToast(res.data.message, 'success');
            if (selectedQuest && selectedQuest.QuestID === questToDelete) setSelectedQuest(null);
            fetchQuests();
        } catch (error) {
            showToast(error.response?.data?.message || "Cancellation failed.", 'error');
        } finally {
            setQuestToDelete(null);
        }
    };

    const getPageTitle = () => {
        switch(filterType) {
            case 'Saved': return <><Bookmark className="text-amber-500" size={40} /> Saved Bounties</>;
            case 'MyGigs': return <><Briefcase className="text-amber-500" size={40} /> My Active Gigs</>;
            case 'Manage': return <><Users className="text-amber-500" size={40} /> Quests I Posted</>;
            default: return <><Search className="text-amber-500" size={40} /> The Notice Board</>;
        }
    };

    return (
        <div className="py-4 animate-fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b-2 border-amber-900/30 pb-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-amber-100 mb-2 tracking-widest uppercase drop-shadow-lg flex items-center gap-3">
                        {getPageTitle()}
                    </h1>
                </div>
                {filterType === 'Board' && (
                    <button onClick={() => setIsPostModalOpen(true)} className="bg-amber-600 hover:bg-amber-500 text-amber-50 px-6 py-3 border-2 border-amber-200 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none cursor-pointer">
                        <PlusCircle size={20} /> Post a Bounty
                    </button>
                )}
            </div>

            {filterType === 'Board' && (
                <div className="flex gap-4 mb-8">
                    {['All', 'Errand', 'Social'].map(f => (
                        <button key={f} onClick={() => setBoardCategory(f)} className={`px-5 py-2 font-bold uppercase tracking-wider transition-all border-2 border-amber-900/50 cursor-pointer ${boardCategory === f ? 'bg-amber-900 text-amber-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]' : 'bg-[#2a1d12] text-amber-500 hover:bg-amber-900/40'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            )}

            {filterType === 'MyGigs' && (
                <div className="flex gap-4 mb-8">
                    {['Pending', 'InProgress', 'Completed'].map(f => (
                        <button key={f} onClick={() => setMyGigsCategory(f)} className={`px-5 py-2 font-bold uppercase tracking-wider transition-all border-2 border-amber-900/50 cursor-pointer ${myGigsCategory === f ? 'bg-amber-900 text-amber-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]' : 'bg-[#2a1d12] text-amber-500 hover:bg-amber-900/40'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-20 text-amber-500 animate-pulse font-bold text-xl uppercase tracking-widest">Consulting the Oracles...</div>
            ) : displayedQuests.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/50 border-2 border-dashed border-amber-900/50 rounded-lg text-amber-200/50 italic font-medium">
                    The board is bare. No scrolls found here.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedQuests.map(quest => (
                        <div key={quest.QuestID} className="bg-[#fdf6e3] p-6 relative shadow-[8px_8px_0px_rgba(0,0,0,0.6)] border-4 border-double border-amber-900 flex flex-col h-full">
                            
                            <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-amber-900"></div>
                            <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-amber-900"></div>
                            <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-amber-900"></div>
                            <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-amber-900"></div>

                            {(filterType === 'Board' || filterType === 'Saved') && (
                                <button 
                                    onClick={() => toggleBookmark(quest.QuestID)}
                                    className="absolute top-14 right-6 text-amber-900 hover:text-amber-600 hover:scale-110 transition-transform z-10 cursor-pointer"
                                    title={bookmarkedIds.has(quest.QuestID) ? "Remove Bookmark" : "Save Quest"}
                                >
                                    {bookmarkedIds.has(quest.QuestID) ? <BookmarkCheck size={28} className="fill-amber-900" /> : <Bookmark size={28} />}
                                </button>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-amber-900/30 ${quest.QuestType === 'Social' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'}`}>
                                    {quest.QuestType}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border-2 ${quest.Status === 'Open' ? 'border-green-500 text-green-700' : 'border-amber-500 text-amber-700'}`}>{quest.Status}</span>
                            </div>
                            
                            <h3 className={`text-2xl font-black text-amber-950 mb-3 leading-tight line-clamp-2 ${(filterType === 'Board' || filterType === 'Saved') ? 'pr-12' : ''}`}>{quest.Title}</h3>
                            
                            <div className="mt-auto space-y-2 border-t-2 border-dashed border-amber-900/30 pt-4">
                                <div className="flex justify-between text-amber-900 font-bold text-sm">
                                    <span className="flex items-center"><Coins size={14} className="mr-1" /> {quest.RewardAmount > 0 ? `${quest.RewardAmount} G` : 'Glory!'}</span>
                                    {quest.RewardAmount > 0 && ['Accepted', 'InProgress'].includes(quest.Status) && (
                                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 rounded border border-amber-400 flex items-center gap-1"><Lock size={10}/> Secured</span>
                                    )}
                                </div>
                                <div className="flex items-center text-amber-900 font-bold text-sm">
                                    <MapPin size={14} className="mr-1 text-amber-600" /> Location: <span className="ml-1 font-sans font-medium">{quest.Location}</span>
                                </div>
                                {quest.ExpiresAt && (
                                    <div className="flex items-center text-amber-900 font-bold text-sm">
                                        <Clock size={14} className="mr-1 text-amber-600" /> Expires: <span className="ml-1 font-sans font-medium">{new Date(quest.ExpiresAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-amber-900/70 text-xs italic mt-2">
                                    <User size={12} className="mr-1" /> Posted by {quest.QuestGiverName}
                                </div>

                                <div className="pt-4 mt-4 border-t border-amber-900/20 flex gap-2">
                                    <button onClick={() => handleOpenDetails(quest)} className="flex-1 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold uppercase tracking-wider text-xs border-2 border-amber-900/40 transition-colors flex justify-center items-center gap-1 cursor-pointer">
                                        <Info size={14}/> Details
                                    </button>

                                    {filterType === 'Board' && quest.Status === 'Open' && quest.QuestGiverName !== user.fullName && (
                                        <button onClick={() => handleApply(quest.QuestID)} className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase tracking-wider text-xs border-2 border-emerald-950 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer">
                                            Apply
                                        </button>
                                    )}

                                    {filterType === 'Manage' && quest.Status === 'Open' && (
                                    <Link to={`/manage/${quest.QuestID}/applicants`} className="flex-1 py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold uppercase tracking-wider text-xs border-2 border-amber-950 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] flex justify-center items-center gap-1 hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer">
                                        <Users size={14}/> Applicants
                                    </Link>
                                )}

                                {filterType === 'MyGigs' && quest.GigState === 'Pending' && (
                                    <span className="flex-1 py-2 bg-slate-300 text-slate-600 font-bold uppercase tracking-wider text-[10px] sm:text-xs border-2 border-slate-400 text-center flex justify-center items-center gap-1 shadow-inner cursor-not-allowed">
                                        <Clock size={12} /> Awaiting...
                                    </span>
                                )}

                                {filterType === 'MyGigs' && quest.Status === 'Accepted' && quest.GigState === 'Hired' && (
                                    <button onClick={() => handleStatusUpdate(quest.QuestID, 'InProgress')} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-xs border-2 border-blue-900 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] flex justify-center items-center gap-1 hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer">
                                        <PlayCircle size={14}/> Start
                                    </button>
                                )}

                                {filterType === 'MyGigs' && quest.Status === 'InProgress' && quest.GigState === 'Hired' && (
                                    !quest.TakerMarkedComplete ? (
                                            <button onClick={() => handleStatusUpdate(quest.QuestID, 'Completed')} className="flex-1 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold uppercase tracking-wider text-[10px] sm:text-xs border-2 border-purple-950 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] flex justify-center items-center gap-1 hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer">
                                                <CheckSquare size={14}/> Complete
                                            </button>
                                        ) : (
                                            <span className="flex-1 py-2 bg-slate-300 text-slate-600 font-bold uppercase tracking-wider text-[10px] sm:text-xs border-2 border-slate-400 text-center flex justify-center items-center gap-1 shadow-inner cursor-not-allowed">
                                                <Clock size={12} /> Waiting...
                                            </span>
                                        )
                                    )}

                                    {filterType === 'Manage' && quest.Status === 'InProgress' && (
                                        !quest.GiverMarkedComplete ? (
                                            <button onClick={() => handleStatusUpdate(quest.QuestID, 'Completed')} className="flex-1 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold uppercase tracking-wider text-[10px] sm:text-xs border-2 border-purple-950 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] flex justify-center items-center gap-1 hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer">
                                                <CheckSquare size={14}/> Complete
                                            </button>
                                        ) : (
                                            <span className="flex-1 py-2 bg-slate-300 text-slate-600 font-bold uppercase tracking-wider text-[10px] sm:text-xs border-2 border-slate-400 text-center flex justify-center items-center gap-1 shadow-inner cursor-not-allowed">
                                                <Clock size={12} /> Waiting...
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedQuest && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-[#fdf6e3] p-8 max-w-2xl w-full relative shadow-[16px_16px_0px_rgba(0,0,0,0.8)] border-4 border-double border-amber-900 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelectedQuest(null)} className="absolute top-4 right-4 text-amber-900 hover:text-amber-700"><X size={28} /></button>
                        
                        <div className="flex justify-between items-start mb-6 border-b-2 border-amber-900/20 pb-4 pr-8">
                            <h2 className="text-3xl font-black text-amber-950 uppercase tracking-widest leading-tight">
                                {isEditing ? 'Edit Quest Details' : selectedQuest.Title}
                            </h2>
                            {!isEditing && selectedQuest.QuestGiverName === user.fullName && selectedQuest.Status === 'Open' && (
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => setIsEditing(true)} className="flex justify-center items-center gap-1 text-sm font-bold text-amber-700 hover:text-amber-900 bg-amber-200 px-3 py-1.5 border border-amber-400 shadow-sm transition-colors hover:bg-amber-300 cursor-pointer">
                                        <Edit2 size={14}/> Edit
                                    </button>
                                    <button onClick={() => initiateCancelQuest(selectedQuest.QuestID)} className="flex justify-center items-center gap-1 text-sm font-bold text-red-700 hover:text-red-900 bg-red-200 px-3 py-1.5 border border-red-400 shadow-sm transition-colors hover:bg-red-300 cursor-pointer">
                                        <Trash2 size={14}/> Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdateQuest} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">Title</label>
                                    <input type="text" required className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none font-sans" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">Description</label>
                                    <textarea required rows="4" className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none font-sans resize-none" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">Location</label>
                                        <input type="text" required className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">Expires On</label>
                                        <input type="date" required min={today} className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none" value={editForm.expiresAt} onChange={e => setEditForm({...editForm, expiresAt: e.target.value})} />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-3 border-2 border-green-950 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] uppercase tracking-widest flex justify-center items-center gap-2 hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer">
                                        <Save size={18}/> Save Magic
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold py-3 border-2 border-slate-500 uppercase tracking-widest transition-colors cursor-pointer">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-amber-900/90 font-sans text-lg whitespace-pre-wrap">{selectedQuest.Description}</p>
                                
                                <div className="bg-amber-100/50 p-4 border-2 border-dashed border-amber-900/30 grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Reward</p>
                                        <p className="font-black text-amber-950 flex items-center gap-1"><Coins size={16} className="text-amber-600"/> {selectedQuest.RewardAmount > 0 ? `${selectedQuest.RewardAmount} Gold` : 'Glory & Honor'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Status</p>
                                        <p className="font-black text-amber-950">{selectedQuest.Status}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Location</p>
                                        <p className="font-bold text-amber-950 flex items-center gap-1"><MapPin size={16} className="text-amber-600"/> {selectedQuest.Location}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Posted By</p>
                                        <p className="font-bold text-amber-950 flex items-center gap-1"><User size={16} className="text-amber-600"/> {selectedQuest.QuestGiverName}</p>
                                    </div>
                                    
                                    {['Accepted', 'InProgress', 'Completed'].includes(selectedQuest.Status) && selectedQuest.QuestTakerName && (
                                        <div className="col-span-2 bg-emerald-100/50 p-3 border border-emerald-900/20 rounded">
                                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1">Quest Assigned To</p>
                                            <p className="font-black text-emerald-950 flex items-center gap-1"><ShieldCheck size={16} className="text-emerald-700"/> {selectedQuest.QuestTakerName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isPostModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-[#fdf6e3] p-8 max-w-lg w-full relative shadow-[16px_16px_0px_rgba(0,0,0,0.8)] border-4 border-double border-amber-900 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsPostModalOpen(false)} className="absolute top-4 right-4 text-amber-900 hover:text-amber-700">
                            <X size={28} />
                        </button>
                        
                        <h2 className="text-3xl font-black text-amber-950 mb-6 uppercase tracking-widest border-b-2 border-amber-900/20 pb-4">Draft a Bounty</h2>
                        
                        <div className="mb-6 bg-amber-100/50 p-4 border border-amber-900/20">
                            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2"><Wand2 size={14}/> Quick-Cast Incantations</h4>
                            <div className="flex flex-wrap gap-2">
                                {quickCastTemplates.map((t, idx) => (
                                    <button 
                                        key={idx} type="button" onClick={() => applyTemplate(t)}
                                        className="text-xs font-bold uppercase bg-amber-900 text-amber-100 px-3 py-1.5 hover:bg-amber-800 transition-colors shadow-sm"
                                    >
                                        {t.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handlePostQuest} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">Title</label>
                                <input 
                                    type="text" required
                                    className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none font-sans"
                                    value={newQuest.title} onChange={e => setNewQuest({...newQuest, title: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">Type</label>
                                    <select 
                                        className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none font-sans cursor-pointer"
                                        value={newQuest.questType} 
                                        onChange={e => {
                                            const type = e.target.value;
                                            setNewQuest({
                                                ...newQuest, 
                                                questType: type,
                                                rewardAmount: type === 'Social' ? 0 : newQuest.rewardAmount
                                            });
                                        }}
                                    >
                                        <option value="Errand">Errand</option>
                                        <option value="Social">Social</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">Reward (Gold)</label>
                                    <input 
                                        type="number" min="0" 
                                        required={newQuest.questType !== 'Social'}
                                        disabled={newQuest.questType === 'Social'}
                                        className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none font-sans disabled:opacity-50 disabled:bg-amber-900/10 disabled:cursor-not-allowed transition-all"
                                        value={newQuest.questType === 'Social' ? 0 : newQuest.rewardAmount} 
                                        onChange={e => setNewQuest({...newQuest, rewardAmount: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">Location</label>
                                    <input 
                                        type="text" required
                                        className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none font-sans"
                                        value={newQuest.location} onChange={e => setNewQuest({...newQuest, location: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">Expires On</label>
                                    <input 
                                        type="date" required min={today}
                                        className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none font-sans cursor-pointer"
                                        value={newQuest.expiresAt} onChange={e => setNewQuest({...newQuest, expiresAt: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-amber-950 mb-1 uppercase tracking-wider">Details</label>
                                <textarea 
                                    required rows="3"
                                    className="w-full p-2.5 bg-amber-50 border-2 border-amber-900/40 text-amber-950 outline-none font-sans resize-none"
                                    value={newQuest.description} onChange={e => setNewQuest({...newQuest, description: e.target.value})}
                                ></textarea>
                            </div>
                            
                            <button type="submit" className="w-full bg-amber-900 hover:bg-amber-950 text-[#fdf6e3] font-bold py-3 border-2 border-amber-950 shadow-[4px_4px_0px_rgba(69,26,3,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all uppercase tracking-widest mt-4 cursor-pointer">
                                Pin to Board
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {questToDelete && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-60 flex justify-center items-center p-4">
                    <div className="bg-[#fdf6e3] p-8 max-w-md w-full relative shadow-[16px_16px_0px_rgba(0,0,0,0.8)] border-4 border-double border-red-900 text-center animate-fade-in">
                        <div className="mx-auto bg-red-200 w-20 h-20 rounded-full flex justify-center items-center border-4 border-red-900 mb-4 shadow-inner">
                            <Trash2 size={36} className="text-red-700" />
                        </div>
                        <h2 className="text-3xl font-black text-red-950 mb-2 uppercase tracking-widest">Banish Bounty?</h2>
                        <p className="text-amber-950 font-medium mb-8 text-sm">
                            Are you absolutely sure you want to banish this bounty to the void? Any gold in Escrow will be refunded, but this magic cannot be undone!
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setQuestToDelete(null)} className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold py-3 border-2 border-slate-500 uppercase tracking-widest transition-colors cursor-pointer">
                                Nevermind
                            </button>
                            <button onClick={confirmCancelQuest} className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-3 border-2 border-red-950 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all uppercase tracking-widest cursor-pointer">
                                Yes, Banish!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
