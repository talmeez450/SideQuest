import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
    User, MapPin, Coins, Clock, Bookmark, PlusCircle, Swords, 
    Backpack, X, Wand2, BookmarkCheck, Search 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';

export const QuestBoard = () => {
    const { token } = useContext(AuthContext);
    const [quests, setQuests] = useState([]);
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const [filter, setFilter] = useState('All'); // 'All', 'Errand', 'Social', 'Saved'
    const [isLoading, setIsLoading] = useState(true);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    const [newQuest, setNewQuest] = useState({ title: '', description: '', questType: 'Errand', rewardAmount: '', location: '', expiresAt: '' });

    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const today = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];

    // Fetch quests based on the active filter
    const fetchQuests = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let endpoint = 'http://localhost:5000/api/quests';
            
            if (filter === 'Saved') {
                endpoint = 'http://localhost:5000/api/quests/saved';
            } else if (filter !== 'All') {
                endpoint += `?type=${filter}`;
            }

            const res = await axios.get(endpoint, config);
            setQuests(res.data.data);

            if (filter !== 'Saved') {
                const savedRes = await axios.get('http://localhost:5000/api/quests/saved', config);
                const savedSet = new Set(savedRes.data.data.map(q => q.QuestID));
                setBookmarkedIds(savedSet);
            } else {
                setBookmarkedIds(new Set(res.data.data.map(q => q.QuestID)));
            }
        } catch (error) {
            console.error("Failed to fetch the board:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuests();
    }, [filter, token]);

    const toggleBookmark = async (questId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`http://localhost:5000/api/quests/${questId}/bookmark`, {}, config);
            
            setBookmarkedIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(questId)) {
                    newSet.delete(questId);
                    if (filter === 'Saved') setQuests(quests.filter(q => q.QuestID !== questId));
                } else {
                    newSet.add(questId);
                }
                return newSet;
            });
        } catch (error) {
            console.error("Failed to bookmark:", error);
        }
    };

    const handlePostQuest = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/quests', newQuest, config);
            setIsPostModalOpen(false);
            setNewQuest({ title: '', description: '', questType: 'Errand', rewardAmount: '', location: '', expiresAt: '' });
            setFilter('All'); 
            fetchQuests();
        } catch (error) {
            console.error("Failed to post quest:", error);
        }
    };

    const getFutureDate = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        const offset = d.getTimezoneOffset() * 60000;
        return (new Date(d.getTime() - offset)).toISOString().split('T')[0];
    };

    const quickCastTemplates = [
        { title: "Need +1 for Futsal", type: "Social", reward: 0, location: "", expiresAt: null },
        { title: "Courier Needed", type: "Errand", reward: 300, location: "", expiresAt: null }
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

    return (
        <div className="py-8 animate-fade-in relative">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b-2 border-amber-900/30 pb-6">
                <div>
                    <h1 className="text-5xl font-black text-amber-100 mb-2 tracking-widest uppercase drop-shadow-lg flex items-center gap-3">
                        <Search className="text-amber-500" size={40} /> The Quest Board
                    </h1>
                    <p className="text-amber-200/70 italic text-lg">Bounties, tasks, and companions await.</p>
                </div>

                <button 
                    onClick={() => setIsPostModalOpen(true)}
                    className="bg-amber-600 hover:bg-amber-500 text-amber-50 px-6 py-3 border-2 border-amber-200 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] hover:translate-y-0.5 hover:translate-x-0.5 transition-all font-black uppercase tracking-widest flex items-center gap-2"
                >
                    <PlusCircle size={20} /> Post a Bounty
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-4 mb-8">
                {['All', 'Errand', 'Social', 'Saved'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2 font-bold uppercase tracking-wider transition-all border-2 border-amber-900/50 ${filter === f ? 'bg-amber-900 text-amber-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]' : 'bg-[#2a1d12] text-amber-500 hover:bg-amber-900/40 hover:text-amber-300'}`}
                    >
                        {f === 'Saved' ? <Bookmark size={16} className="inline mr-2 mb-0.5" /> : null}
                        {f}
                    </button>
                ))}
            </div>

            {/* Quest Grid */}
            {isLoading ? (
                <div className="text-center py-20 text-amber-500 animate-pulse font-bold text-xl uppercase tracking-widest">Consulting the Oracles...</div>
            ) : quests.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/50 border-2 border-dashed border-amber-900/50 rounded-lg text-amber-200/50 italic">
                    The board is bare. No scrolls match your search.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {quests.map(quest => (
                        <div key={quest.QuestID} className="bg-[#fdf6e3] p-6 relative shadow-[8px_8px_0px_rgba(0,0,0,0.6)] border-4 border-double border-amber-900 group flex flex-col h-full">
                            {/* Corners */}
                            <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-amber-900"></div>
                            <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-amber-900"></div>
                            <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-amber-900"></div>
                            <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-amber-900"></div>
                            
                            {/* Bookmark Toggle */}
                            <button 
                                onClick={() => toggleBookmark(quest.QuestID)}
                                className="absolute top-4 right-4 text-amber-900 hover:text-amber-600 hover:scale-110 transition-transform"
                                title="Save Quest"
                            >
                                {bookmarkedIds.has(quest.QuestID) ? <BookmarkCheck size={28} className="fill-amber-900" /> : <Bookmark size={28} />}
                            </button>

                            {/* Type Badge */}
                            <div className="mb-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-widest border border-amber-900/30 ${quest.QuestType === 'Social' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'}`}>
                                    {quest.QuestType === 'Social' ? <Swords size={14} /> : <Backpack size={14} />}
                                    {quest.QuestType}
                                </span>
                            </div>

                            <h3 className="text-2xl font-black text-amber-950 mb-3 leading-tight pr-8">{quest.Title}</h3>
                            <p className="text-amber-900/80 mb-6 grow font-sans text-sm line-clamp-3">{quest.Description}</p>

                            <div className="mt-auto space-y-2 border-t-2 border-dashed border-amber-900/30 pt-4">
                                <div className="flex items-center text-amber-900 font-bold text-sm">
                                    <Coins size={16} className="mr-2 text-amber-600" /> 
                                    Reward: <span className="ml-1 text-amber-700">{quest.RewardAmount > 0 ? `${quest.RewardAmount} Gold` : 'None (Glory!)'}</span>
                                </div>
                                <div className="flex items-center text-amber-900 font-bold text-sm">
                                    <MapPin size={16} className="mr-2 text-amber-600" /> 
                                    Location: <span className="ml-1 font-sans font-medium">{quest.Location}</span>
                                </div>
                                {/* Expiration Date */}
                                {quest.ExpiresAt && (
                                    <div className="flex items-center text-amber-900 font-bold text-sm">
                                        <Clock size={16} className="mr-2 text-amber-600" /> 
                                        Expires: <span className="ml-1 font-sans font-medium">{new Date(quest.ExpiresAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-amber-900/70 text-xs italic mt-2">
                                    <User size={14} className="mr-1" /> Posted by {quest.QuestGiverName}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Post Quest */}
            {isPostModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-[#fdf6e3] p-8 max-w-lg w-full relative shadow-[16px_16px_0px_rgba(0,0,0,0.8)] border-4 border-double border-amber-900 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsPostModalOpen(false)} className="absolute top-4 right-4 text-amber-900 hover:text-amber-700">
                            <X size={28} />
                        </button>
                        
                        <h2 className="text-3xl font-black text-amber-950 mb-6 uppercase tracking-widest border-b-2 border-amber-900/20 pb-4">Draft a Bounty</h2>
                        
                        {/* Quick-Cast Spells */}
                        <div className="mb-6 bg-amber-100/50 p-4 border border-amber-900/20">
                            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2"><Wand2 size={14}/> Quick-Cast Incantations</h4>
                            <div className="flex flex-wrap gap-2">
                                {quickCastTemplates.map((t, idx) => (
                                    <button 
                                        key={idx} onClick={() => applyTemplate(t)}
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
                            
                            <button type="submit" className="w-full bg-amber-900 hover:bg-amber-950 text-[#fdf6e3] font-bold py-3 border-2 border-amber-950 shadow-[4px_4px_0px_rgba(69,26,3,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all uppercase tracking-widest mt-4">
                                Pin to Board
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
