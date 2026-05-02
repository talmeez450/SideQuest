import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Coins, Lock, TrendingDown, TrendingUp, Wallet as WalletIcon } from 'lucide-react';

import { AuthContext } from "../context/AuthContext";

export const WalletVault = () => {
    const { token } = useContext(AuthContext);
    const [walletData, setWalletData] = useState({ balances: null, history: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5000/api/wallet', config);
                setWalletData({ balances: res.data.balances, history: res.data.history });
            } catch (error) { console.error("Failed to fetch wallet"); }
            finally { setIsLoading(false); }
        };
        fetchWallet();
    }, [token]);

    if (isLoading) return <div className="text-center py-20 text-amber-500 animate-pulse font-bold text-xl uppercase tracking-widest">Opening the Vault...</div>;

    const walletBalance = walletData.balances?.WalletBalance ?? 0;
    const escrowBalance = walletData.balances?.EscrowBalance ?? 0;

    return (
        <div className="py-8 animate-fade-in">
            <h1 className="text-4xl font-black text-amber-100 mb-8 tracking-widest uppercase flex items-center gap-3"><WalletIcon className="text-amber-500" size={36} /> The Golden Vault</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-[#fdf6e3] p-6 border-4 border-double border-amber-900 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] flex items-center gap-4">
                    <div className="bg-amber-200 p-4 rounded-full border-2 border-amber-500 shadow-inner"><Coins size={40} className="text-amber-700" /></div>
                    <div><p className="text-amber-900/70 font-bold uppercase tracking-wider text-sm">Available Gold</p><p className="text-4xl font-black text-amber-950">{walletBalance} G</p></div>
                </div>
                <div className="bg-slate-800 p-6 border-4 border-double border-slate-600 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] flex items-center gap-4">
                    <div className="bg-slate-700 p-4 rounded-full border-2 border-slate-500 shadow-inner"><Lock size={40} className="text-slate-300" /></div>
                    <div><p className="text-slate-400 font-bold uppercase tracking-wider text-sm">Locked in Escrow</p><p className="text-4xl font-black text-white">{escrowBalance} G</p></div>
                </div>
            </div>
            <h2 className="text-2xl font-black text-amber-100 mb-4 tracking-widest uppercase">Ledger of Deeds</h2>
            <div className="bg-[#fdf6e3] border-4 border-double border-amber-900 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] overflow-x-auto">
                <table className="w-full text-left font-sans">
                    <thead className="bg-amber-900 text-amber-50 uppercase tracking-wider text-xs">
                        <tr><th className="p-4 py-3 border-b-2 border-amber-950 w-24">Scroll No.</th><th className="p-4 py-3 border-b-2 border-amber-950">Quest Details</th><th className="p-4 py-3 border-b-2 border-amber-950">Date</th><th className="p-4 py-3 border-b-2 border-amber-950 text-right">Amount Flow</th></tr>
                    </thead>
                    <tbody className="text-amber-950 font-medium text-sm">
                        {walletData.history.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-amber-900/60 italic font-bold">No gold has exchanged hands yet.</td></tr>
                        ) : (
                            walletData.history.map((tx, idx) => (
                                <tr key={idx} className="border-b border-amber-900/20 hover:bg-amber-100/50 transition-colors">
                                    <td className="p-4 font-bold text-amber-900/50">#{idx + 1}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-amber-950 text-base">{tx.Title}</p>
                                        <p className="text-xs text-amber-800/80 mt-0.5">{tx.TransactionType === 'Earned' ? `Hired by ${tx.GiverName}` : `Completed by ${tx.TakerName}`}</p>
                                    </td>
                                    <td className="p-4 text-amber-900/80">{new Date(tx.CreatedAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right font-black text-lg">
                                        {tx.TransactionType === 'Earned' ? <span className="text-green-600 flex items-center justify-end gap-1"><TrendingUp size={18} strokeWidth={3} /> +{tx.RewardAmount}</span> : <span className="text-red-600 flex items-center justify-end gap-1"><TrendingDown size={18} strokeWidth={3} /> -{tx.RewardAmount}</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
