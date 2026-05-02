import { User } from 'lucide-react';

export const UserAvatar = ({ src, size = 16, className = "" }) => {
    if (src && src.trim() !== '') {
        return <img src={src} className={`rounded-full object-cover border border-amber-900/30 inline-block ${className}`} style={{ width: size, height: size, minWidth: size, minHeight: size }} alt="Avatar" />;
    }
    return <span className={`inline-flex items-center justify-center rounded-full bg-amber-800 text-amber-100 ${className}`} style={{ width: size, height: size, minWidth: size, minHeight: size }}><User size={size * 0.6} /></span>;
};
