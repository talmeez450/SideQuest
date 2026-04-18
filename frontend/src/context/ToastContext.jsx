import { createContext, useContext, useState } from 'react';
import { CheckCircle, X, XCircle } from 'lucide-react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <div 
                        key={t.id} 
                        className={`pointer-events-auto flex items-center gap-3 p-4 border-4 border-double shadow-[8px_8px_0px_rgba(0,0,0,0.6)] animate-fade-in transition-all ${
                            t.type === 'success' 
                            ? 'bg-green-100 border-green-900 text-green-900' 
                            : 'bg-red-100 border-red-900 text-red-900'
                        }`}
                    >
                        {t.type === 'success' ? <CheckCircle size={24} className="text-green-700" /> : <XCircle size={24} className="text-red-700" />}
                        <span className="font-black uppercase tracking-wider text-sm">{t.message}</span>
                        <button onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))} className="ml-4 hover:scale-110 transition-transform">
                            <X size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
