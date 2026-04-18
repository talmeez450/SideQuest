import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Lock, Mail, ShieldCheck, User, UserPlus } from 'lucide-react';

export const Register = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', cnic: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'cnic') {
            value = value.replace(/\D/g, ''); 
            if (value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5);
            if (value.length > 13) value = value.slice(0, 13) + '-' + value.slice(13, 14);
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        if (!cnicRegex.test(formData.cnic)) {
            return setError('Forged Royal Seal! CNIC must be 13 digits (XXXXX-XXXXXXX-X).');
        }
        if (formData.password.length < 6) {
            return setError('Your Secret Cipher is too weak! Must be at least 6 characters.');
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', formData);
            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'The ink spilled. Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex justify-center items-center min-h-[85vh] px-4">
                <div className="bg-[#fdf6e3] p-10 max-w-md w-full text-center border-4 border-double border-amber-900 rounded-sm shadow-[12px_12px_0px_rgba(30,15,5,0.6)]">
                    <div className="flex justify-center mb-6 text-amber-900 animate-bounce mt-4"><ShieldCheck size={64} strokeWidth={1.5} /></div>
                    <h2 className="text-3xl font-black text-amber-950 mb-4 uppercase tracking-widest">Oath Accepted!</h2>
                    <p className="text-amber-800 italic">Your name has been written in the guild ledger. Opening the tavern doors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-[85vh] px-4 py-8">
            <div className="bg-[#fdf6e3] p-10 max-w-md w-full relative shadow-[12px_12px_0px_rgba(30,15,5,0.6)] border-4 border-double border-amber-900 rounded-sm">
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-900"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-900"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-900"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-900"></div>
                
                <div className="flex justify-center mb-4 text-amber-900">
                    <UserPlus size={48} strokeWidth={1.5} />
                </div>
                
                <h2 className="text-3xl font-black text-center text-amber-950 mb-2 uppercase tracking-widest">Join the Guild</h2>
                <p className="text-center text-amber-800/80 mb-8 italic text-sm">Tier 1 KYC requires a royal seal (CNIC) for safe travels.</p>

                {error && <div className="bg-red-900 text-red-100 p-3 mb-6 text-sm text-center border-2 border-red-950 font-bold uppercase tracking-wider">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-amber-950 mb-1.5 uppercase tracking-wider">Known Title (Full Name)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-amber-800" />
                            </div>
                            <input 
                                type="text" name="fullName" required
                                className="w-full pl-10 p-3 bg-amber-50 border-2 border-amber-900/40 text-amber-950 focus:bg-[#fdf6e3] focus:ring-0 focus:border-amber-900 transition-colors outline-none font-sans font-medium"
                                placeholder="Geralt of Rivia" value={formData.fullName} onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-amber-950 mb-1.5 uppercase tracking-wider">Courier Pigeon (Email)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={18} className="text-amber-800" />
                            </div>
                            <input 
                                type="email" name="email" required
                                className="w-full pl-10 p-3 bg-amber-50 border-2 border-amber-900/40 text-amber-950 focus:bg-[#fdf6e3] focus:ring-0 focus:border-amber-900 transition-colors outline-none font-sans font-medium"
                                placeholder="adventurer@sidequest.com" value={formData.email} onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-amber-950 mb-1.5 uppercase tracking-wider">Royal Seal (CNIC)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard size={18} className="text-amber-800" />
                            </div>
                            <input 
                                type="text" name="cnic" required pattern="\d{5}-\d{7}-\d{1}" maxLength="15"
                                className="w-full pl-10 p-3 bg-amber-50 border-2 border-amber-900/40 text-amber-950 focus:bg-[#fdf6e3] focus:ring-0 focus:border-amber-900 transition-colors outline-none font-sans font-medium"
                                placeholder="12345-1234567-1" value={formData.cnic} onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-amber-950 mb-1.5 uppercase tracking-wider">Secret Cipher (Password)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-amber-800" />
                            </div>
                            <input 
                                type="password" name="password" required minLength="6"
                                className="w-full pl-10 p-3 bg-amber-50 border-2 border-amber-900/40 text-amber-950 focus:bg-[#fdf6e3] focus:ring-0 focus:border-amber-900 transition-colors outline-none font-sans font-medium"
                                placeholder="••••••••" value={formData.password} onChange={handleChange}
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" disabled={isLoading}
                        className="w-full bg-amber-900 hover:bg-amber-950 text-[#fdf6e3] font-bold py-4 border-2 border-amber-950 shadow-[4px_4px_0px_rgba(69,26,3,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all duration-150 mt-6 flex justify-center items-center uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sealing the Oath...' : 'Swear the Oath'}
                    </button>
                </form>
                <div className="mt-8 text-center text-sm text-amber-900/80 border-t-2 border-amber-900/20 pt-6">
                    Already carrying a guild card? <Link to="/login" className="text-amber-900 font-black hover:text-amber-700 underline decoration-2 underline-offset-4 uppercase transition-colors">Enter here</Link>
                </div>
            </div>
        </div>
    );
};
