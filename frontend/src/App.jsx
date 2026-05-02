import { useContext } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { AdminPanel } from './components/AdminPanel';
import { ApplicantsPage } from './components/ApplicantsPage';
import { HallOfFame } from './components/HallOfFame';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { Profile } from './components/Profile';
import { QuestBoard } from './components/QuestBoard';
import { Register } from './components/Register';
import { Sidebar } from './components/Sidebar';
import { TavernChat } from './components/TavernChat';
import { WalletVault } from './components/WalletVault';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

export const checkKycVerified = (val) => {
    if (!val) return false;
    if (val === true || val === 1 || val === '1' || val === 'true' || val === 'Approved') return true;
    if (typeof val === 'object' && val.type === 'Buffer' && Array.isArray(val.data)) return val.data[0] === 1;
    return false;
};

const ProtectedRoute = ({ children }) => {
    const { token } = useContext(AuthContext);
    return token ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <Router>
                    <div className="h-screen bg-slate-900 text-amber-50 font-serif selection:bg-amber-900 selection:text-amber-100 flex flex-col overflow-hidden">
                        <Navbar />
                        <div className="flex flex-1 overflow-hidden relative">
                            <Sidebar />
                            <main className="flex-1 overflow-y-auto w-full p-4 md:p-6 lg:p-8 pb-24 md:pb-8 relative">
                                <div className="max-w-6xl mx-auto">
                                    <Routes>
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        
                                        <Route path="/" element={<ProtectedRoute><QuestBoard filterType="Board" /></ProtectedRoute>} />
                                        <Route path="/my-gigs" element={<ProtectedRoute><QuestBoard filterType="MyGigs" /></ProtectedRoute>} />
                                        <Route path="/manage" element={<ProtectedRoute><QuestBoard filterType="Manage" /></ProtectedRoute>} />
                                        <Route path="/manage/:id/applicants" element={<ProtectedRoute><ApplicantsPage /></ProtectedRoute>} />
                                        <Route path="/saved" element={<ProtectedRoute><QuestBoard filterType="Saved" /></ProtectedRoute>} />
                                        <Route path="/wallet" element={<ProtectedRoute><WalletVault /></ProtectedRoute>} />
                                        
                                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                                        <Route path="/chat/:questId/:otherUserId" element={<ProtectedRoute><TavernChat /></ProtectedRoute>} />
                                        <Route path="/hall-of-fame" element={<ProtectedRoute><HallOfFame /></ProtectedRoute>} />
                                    </Routes>
                                </div>
                            </main>
                        </div>
                    </div>
                </Router>
            </AuthProvider>
        </ToastProvider>
    );
}
