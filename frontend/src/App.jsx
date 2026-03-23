import React, { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { AuthContext, AuthProvider} from './context/AuthContext.jsx';
import { Login } from './components/Login.jsx';
import { Register } from './components/Register.jsx';
import { Navbar } from './components/Navbar.jsx';
import { QuestBoard } from './components/QuestBoard.jsx';

const ProtectedRoute = ({ children }) => {
    const { token } = useContext(AuthContext);
    return token ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-slate-900 text-amber-50 font-serif selection:bg-amber-900 selection:text-amber-100">
                    <Navbar />
                    <main className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route 
                                path="/" 
                                element={
                                    <ProtectedRoute>
                                        <QuestBoard />
                                    </ProtectedRoute>
                                } 
                            />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}