import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, Compass } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx'


export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            if (response.data.success) {
                login(response.data.user, response.data.token);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'The magic fizzled. Server connection failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[85vh] px-4">
            <div className="bg-[#fdf6e3] p-10 max-w-md w-full relative shadow-[12px_12px_0px_rgba(30,15,5,0.6)] border-4 border-double border-amber-900 rounded-sm">
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-900"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-900"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-900"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-900"></div>
                
                <div className="flex justify-center mb-4 text-amber-900">
                    <Compass size={48} strokeWidth={1.5} />
                </div>
                
                <h2 className="text-4xl font-black text-center text-amber-950 mb-2 uppercase tracking-widest">Welcome Back</h2>
                <p className="text-center text-amber-800/80 mb-8 italic">Unroll the parchment and state your credentials.</p>

                {error && (
                    <div className="bg-red-900 text-red-100 p-3 mb-6 text-sm text-center border-2 border-red-950 font-bold uppercase tracking-wider">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-amber-950 mb-2 uppercase tracking-wider">Scroll of Address (Email)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={18} className="text-amber-800" />
                            </div>
                            <input 
                                type="email" required
                                className="w-full pl-10 p-3 bg-amber-50 border-2 border-amber-900/40 text-amber-950 focus:bg-[#fdf6e3] focus:ring-0 focus:border-amber-900 transition-colors outline-none font-sans font-medium"
                                placeholder="adventurer@sidequest.com" value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-amber-950 mb-2 uppercase tracking-wider">Secret Cipher (Password)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-amber-800" />
                            </div>
                            <input 
                                type="password" required
                                className="w-full pl-10 p-3 bg-amber-50 border-2 border-amber-900/40 text-amber-950 focus:bg-[#fdf6e3] focus:ring-0 focus:border-amber-900 transition-colors outline-none font-sans font-medium"
                                placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" disabled={isLoading}
                        className="w-full bg-amber-900 hover:bg-amber-950 text-[#fdf6e3] font-bold py-4 border-2 border-amber-950 shadow-[4px_4px_0px_rgba(69,26,3,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all duration-150 mt-6 flex justify-center items-center uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Consulting the Oracles...' : 'Enter the Tavern'}
                    </button>
                </form>
                
                <div className="mt-8 text-center text-sm text-amber-900/80 border-t-2 border-amber-900/20 pt-6">
                    A new face in town? <Link to="/register" className="text-amber-900 font-black hover:text-amber-700 underline decoration-2 underline-offset-4 uppercase transition-colors">Join the Guild</Link>
                </div>
            </div>
        </div>
    );
};

