import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';

import { UserAvatar } from './UserAvatar';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const TavernChat = () => {
    const { questId, otherUserId } = useParams();
    const { user, token } = useContext(AuthContext);
    const { showToast } = useToast();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [chatInfo, setChatInfo] = useState({ otherUserName: 'Adventurer', questTitle: 'A Noble Quest', otherUserAvatar: null });
    const bottomRef = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/chat/${questId}/${otherUserId}`, { headers: { Authorization: `Bearer ${token}` } });
                setMessages(res.data.data);
                setChatInfo({ otherUserName: res.data.otherUserName, questTitle: res.data.questTitle, otherUserAvatar: res.data.otherUserAvatar });
                setIsLoading(false);
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            } catch (error) { console.error("Failed to load chat history"); }
        };
        fetchMessages();
        const intervalId = setInterval(fetchMessages, 3000);
        return () => clearInterval(intervalId);
    }, [questId, otherUserId, token]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        try {
            const res = await axios.post(`http://localhost:5000/api/chat/${questId}/${otherUserId}`, { content: text }, { headers: { Authorization: `Bearer ${token}` } });
            setMessages([...messages, res.data.data]);
            setText('');
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (error) { showToast("Failed to send message", "error"); }
    };

    return (
        <div className="py-8 animate-fade-in max-w-3xl mx-auto h-[80vh] flex flex-col">
            <h1 className="text-3xl font-black text-amber-100 mb-6 tracking-widest uppercase flex items-center gap-3">
                <MessageSquare className="text-amber-500" size={32} /> Tavern Whispers
            </h1>
            
            <div className="bg-[#fdf6e3] border-4 border-double border-amber-900 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] flex flex-col flex-1 overflow-hidden">
                <div className="bg-amber-900 p-4 text-amber-100 font-bold uppercase tracking-widest flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="flex items-center gap-2"><UserAvatar src={chatInfo.otherUserAvatar} size={20} className="border border-amber-400" /> Whispering to: {chatInfo.otherUserName}</span>
                        <span className="text-[10px] text-amber-300 mt-1 opacity-80 capitalize">Quest: {chatInfo.questTitle}</span>
                    </div>
                    <Link to="/" className="text-amber-300 hover:text-amber-100 text-xs flex items-center gap-1"><ArrowLeft size={14}/> Board</Link>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-amber-50/50">
                    {isLoading ? (
                        <div className="text-center text-amber-800 animate-pulse font-bold">Connecting to Tavern...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-amber-800/60 italic mt-10">No whispers exchanged yet. Send a greeting!</div>
                    ) : (
                        messages.map(msg => {
                            const isMe = Number(msg.SenderID) === Number(user.id);
                            return (
                                <div key={msg.MessageID} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] p-3 border-2 ${isMe ? 'bg-amber-200 border-amber-500 rounded-tl-xl rounded-bl-xl rounded-tr-xl shadow-sm' : 'bg-[#fdf6e3] border-amber-900/30 rounded-tr-xl rounded-br-xl rounded-tl-xl shadow-sm'}`}>
                                        <p className="text-amber-950 font-sans font-medium text-sm leading-relaxed">{msg.Content}</p>
                                        <p className={`text-[10px] mt-1.5 font-bold ${isMe ? 'text-amber-700/80 text-right' : 'text-amber-800/60'}`}>
                                            {new Date(msg.CreatedAt.endsWith('Z') ? msg.CreatedAt : msg.CreatedAt + 'Z').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>
                
                <form onSubmit={sendMessage} className="p-4 bg-amber-100 border-t-2 border-amber-900/20 flex gap-2">
                    <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Write a message..." className="flex-1 p-3 bg-[#fdf6e3] border-2 border-amber-900/40 text-amber-950 outline-none font-sans" />
                    <button type="submit" disabled={!text.trim()} className="px-6 bg-amber-900 hover:bg-amber-950 text-amber-50 font-bold border-2 border-amber-950 shadow-[2px_2px_0px_rgba(0,0,0,0.8)] transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"><Send size={18} /></button>
                </form>
            </div>
        </div>
    );
};
