import React from 'react';
import { Clock, CheckCircle2, PlayCircle, Loader, Ban, User, Phone, Briefcase, FileText } from 'lucide-react';

const statusMap = {
    pending: { label: 'Kutilmoqda', className: 'status-waiting text-gray-400', dot: 'bg-gray-400', icon: <Loader className="w-4 h-4" /> },
    waiting: { label: 'Tasdiqlandi', className: 'status-waiting border-amber-500/20 bg-amber-500/10 text-amber-400', dot: 'bg-amber-400', icon: <Clock className="w-4 h-4" /> },
    serving: { label: 'Xizmatda', className: 'status-serving border-blue-500/20 bg-blue-500/10 text-blue-400', dot: 'bg-blue-400 animate-pulse', icon: <PlayCircle className="w-4 h-4" /> },
    done: { label: 'Tugadi', className: 'status-done border-emerald-500/20 bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400', icon: <CheckCircle2 className="w-4 h-4" /> },
    rejected: { label: 'Rad etildi', className: 'status-waiting border-red-500/20 bg-red-500/10 text-red-400', dot: 'bg-red-400', icon: <Ban className="w-4 h-4" /> }
};

export default function QueueCard({ entry, position, isAdmin, onStatusChange, onDelete, onApproveClick, onRejectClick, expanded }) {
    const status = statusMap[entry.status] || statusMap.pending;

    // Privacy Masking
    const formatMasked = (str) => {
        if (!str) return '';
        if (str.length < 3) return str;
        return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
    };

    const maskedName = isAdmin ? entry.name : entry.name.split(' ').map(part => formatMasked(part)).join(' ');

    // Check if phone has 998 format
    const phoneStr = entry.phone || '';
    const maskedPhone = isAdmin ? phoneStr :
        (phoneStr.length > 10 ? phoneStr.slice(0, 8) + '*** ** ' + phoneStr.slice(-2) : '*** ** **');

    return (
        <div className="glass flex flex-col gap-0 animate-fade-in hover:bg-white/10 transition-all duration-200 overflow-hidden">
            {/* Main row */}
            <div className="flex items-center gap-3 p-4">
                {/* Queue number */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20 flex-shrink-0">
                    #{entry.queueNumber || position}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate text-sm">{maskedName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {entry.center && (
                            <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{entry.center}</span>
                        )}
                        {entry.department && (
                            <span className="text-xs text-blue-400/70">→ {entry.department}</span>
                        )}
                    </div>
                </div>

                {/* Status badge */}
                <div className="flex-shrink-0 flex items-center gap-2">
                    {entry.status === 'waiting' && entry.assignedTime && (
                        <span className="text-xs text-emerald-400 font-mono tracking-wider bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{entry.assignedTime}</span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                        {status.icon}
                        {status.label}
                    </span>
                </div>

                {/* Admin actions */}
                {isAdmin && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {entry.status === 'pending' && (
                            <>
                                <button onClick={() => onApproveClick && onApproveClick(entry)} className="btn-success text-xs py-1.5 px-2.5">Tasdiqlash</button>
                                <button onClick={() => onRejectClick && onRejectClick(entry._id)} className="btn-danger text-xs py-1.5 px-2.5">Rad etish</button>
                            </>
                        )}
                        {entry.status === 'waiting' && (
                            <button onClick={() => onStatusChange(entry._id, 'serving')} className="btn-warning text-xs py-1.5 px-2.5">Xizmat</button>
                        )}
                        {entry.status === 'serving' && (
                            <button onClick={() => onStatusChange(entry._id, 'done')} className="btn-success text-xs py-1.5 px-2.5">Tugat</button>
                        )}
                        {entry.status !== 'pending' && (
                            <button onClick={() => onDelete(entry._id)} className="btn-danger text-xs py-1.5 px-2.5 bg-red-500/20 text-red-400">✕</button>
                        )}
                    </div>
                )}
            </div>

            {/* Expanded details (admin) */}
            {isAdmin && (
                <div className="border-t border-white/5 px-4 py-2.5 grid grid-cols-3 gap-3 bg-white/2">
                    <div>
                        <p className="text-white/30 text-xs flex items-center gap-1"><Phone className="w-3 h-3" /> Telefon</p>
                        <p className="text-white/70 text-xs font-mono mt-0.5">{maskedPhone}</p>
                    </div>
                    <div>
                        <p className="text-white/30 text-xs flex items-center gap-1"><User className="w-3 h-3" /> Yosh / Jins</p>
                        <p className="text-white/70 text-xs mt-0.5">{entry.age} yosh · {entry.gender === 'male' ? '👨 Erkak' : '👩 Ayol'}</p>
                    </div>
                    <div className="col-span-1">
                        <p className="text-white/30 text-xs flex items-center gap-1"><FileText className="w-3 h-3" /> Shikoyat</p>
                        <p className="text-white/60 text-xs mt-0.5 leading-relaxed line-clamp-2">{entry.complaint}</p>
                        <p className="text-white/30 text-[10px] mt-1">{new Date(entry.createdAt).toLocaleString('uz-UZ')}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
