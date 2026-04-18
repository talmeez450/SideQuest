import { useContext } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { ApplicantsPage } from "./components/ApplicantsPage";
import { Login } from "./components/Login";
import { Navbar } from "./components/Navbar";
import { QuestBoard } from "./components/QuestBoard";
import { Register } from "./components/Register";
import { WalletVault } from "./components/WalletVault";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

const ProtectedRoute = ({ children }) => {
    const { token } = useContext(AuthContext);
    return token ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen bg-slate-900 text-amber-50 font-serif selection:bg-amber-900 selection:text-amber-100 flex flex-col">
                        <Navbar />
                        <main className="grow max-w-6xl mx-auto w-full p-4 md:p-6 lg:p-8">
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                
                                <Route path="/" element={<ProtectedRoute><QuestBoard filterType="Board" /></ProtectedRoute>} />
                                <Route path="/my-gigs" element={<ProtectedRoute><QuestBoard filterType="MyGigs" /></ProtectedRoute>} />
                                <Route path="/manage" element={<ProtectedRoute><QuestBoard filterType="Manage" /></ProtectedRoute>} />
                                <Route path="/manage/:id/applicants" element={<ProtectedRoute><ApplicantsPage /></ProtectedRoute>} />
                                <Route path="/saved" element={<ProtectedRoute><QuestBoard filterType="Saved" /></ProtectedRoute>} />
                                <Route path="/wallet" element={<ProtectedRoute><WalletVault /></ProtectedRoute>} />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </AuthProvider>
        </ToastProvider>
    );
}
