import React, { useState, useEffect } from 'react';
import { getQueue } from '../services/api';
import socket from '../services/socket';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';

const statusMap = {
    pending: { label: 'KUTILMOQDA', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', dot: 'bg-gray-400' },
    waiting: { label: 'TASDIQLANDI', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
    serving: { label: 'XIZMATDA', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400 animate-pulse' },
    done: { label: 'TUGADI', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
};

export default function QueueDisplay() {
    const [queue, setQueue] = useState([]);
    const [now, setNow] = useState(new Date());
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        getQueue().then(res => setQueue(res.data)).catch(console.error);

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('queue:updated', setQueue);
        setConnected(socket.connected);

        const interval = setInterval(() => setNow(new Date()), 1000);

        return () => {
            socket.off('queue:updated');
            socket.off('connect');
            socket.off('disconnect');
            clearInterval(interval);
        };
    }, []);

    const serving = queue.filter(e => e.status === 'serving');
    const waiting = queue.filter(e => e.status === 'waiting' || e.status === 'pending');

    const timeStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-dark-900 bg-grid flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="border-b border-white/5 bg-dark-800/80 backdrop-blur-md">
                <div className="w-full max-w-[1920px] mx-auto px-6 xl:px-16 py-4 xl:py-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Multi-Center" className="h-24 sm:h-32 3xl:h-48 w-auto animate-bounce-in drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] object-contain" />
                        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <p className="font-bold text-white text-lg 3xl:text-3xl hidden sm:block">Navbat Ekrani</p>
                            <p className="text-xs 3xl:text-lg text-white/40 hidden sm:block">Jonli holat</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-2xl 3xl:text-6xl tracking-wider font-mono font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{timeStr}</p>
                        <p className="text-xs 3xl:text-2xl text-white/40 uppercase tracking-widest mt-1 3xl:mt-3">{dateStr}</p>
                    </div>

                    <div className="flex items-center gap-2 3xl:gap-6">
                        <span className={`flex items-center gap-1.5 3xl:gap-3 text-xs 3xl:text-xl px-3 3xl:px-6 py-1.5 3xl:py-3 rounded-full border ${connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                            <span className={`w-1.5 h-1.5 3xl:w-3 3xl:h-3 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                            {connected ? 'Jonli' : 'Ulanmoqda...'}
                        </span>
                        <Link to="/" className="text-xs 3xl:text-xl text-white/30 hover:text-white/60 transition-colors ml-2 3xl:ml-4">← Orqaga</Link>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-[1920px] mx-auto px-6 xl:px-16 py-8 3xl:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 3xl:gap-16">
                {/* Serving now */}
                <div className="animate-slide-up bg-dark-800/30 p-6 3xl:p-10 rounded-3xl border border-white/5">
                    <h2 className="text-sm 3xl:text-2xl font-semibold text-white/40 uppercase tracking-widest mb-4 3xl:mb-8 flex items-center gap-3">
                        <span className="w-2 3xl:w-3 h-2 3xl:h-3 rounded-full bg-blue-500 animate-pulse"></span>
                        Hozir xizmatda
                    </h2>
                    {serving.length === 0 ? (
                        <div className="glass p-16 text-center flex-1 flex flex-col items-center justify-center">
                            <Clock className="w-16 h-16 text-white/20 mb-4 animate-spin-slow" />
                            <p className="text-white/30 text-lg">Xizmat ko'rsatish kutilmoqda</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {serving.map(entry => (
                                <div key={entry._id} className="glass border border-blue-500/30 bg-blue-500/5 p-6 3xl:p-10 rounded-3xl animate-fade-in glow-blue shadow-2xl shadow-blue-900/40">
                                    <div className="flex items-center gap-6 3xl:gap-12">
                                        <div className="w-20 h-20 3xl:w-40 3xl:h-40 rounded-2xl 3xl:rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-500/30 flex-shrink-0 border-2 border-blue-400/50">
                                            <span className="text-2xl 3xl:text-6xl font-black text-white drop-shadow-md">#{entry.queueNumber}</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl 3xl:text-5xl font-bold text-white tracking-tight">{entry.name}</p>
                                            <p className="text-xl 3xl:text-3xl text-white/50 mt-2 3xl:mt-4 font-medium font-mono">{entry.phone}</p>
                                            <div className="flex flex-wrap gap-2 3xl:gap-4 mt-3 3xl:mt-8">
                                                <span className="status-serving 3xl:text-2xl 3xl:px-6 3xl:py-2 drop-shadow-md">
                                                    XIZMATDA
                                                </span>
                                                <span className="bg-dark-900/50 text-white/60 text-xs 3xl:text-xl font-medium px-3 3xl:px-6 py-1.5 3xl:py-2 rounded-full border border-white/10 uppercase drop-shadow-md">
                                                    {entry.department}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats strip */}
                    <div className="mt-6 3xl:mt-12 grid grid-cols-3 gap-3 3xl:gap-8">
                        <div className="glass p-4 3xl:p-8 text-center">
                            <p className="text-3xl 3xl:text-6xl font-bold text-white">{queue.length}</p>
                            <p className="text-xs 3xl:text-2xl text-white/30 mt-1 3xl:mt-3">Jami</p>
                        </div>
                        <div className="glass p-4 3xl:p-8 text-center">
                            <p className="text-3xl 3xl:text-6xl font-bold text-amber-400">{waiting.length}</p>
                            <p className="text-xs 3xl:text-2xl text-white/30 mt-1 3xl:mt-3">Kutmoqda</p>
                        </div>
                        <div className="glass p-4 3xl:p-8 text-center">
                            <p className="text-3xl 3xl:text-6xl font-bold text-emerald-400">{queue.filter(e => e.status === 'done').length}</p>
                            <p className="text-xs 3xl:text-2xl text-white/30 mt-1 3xl:mt-3">Tugadi</p>
                        </div>
                    </div>
                </div>

                {/* Waiting queue */}
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-sm 3xl:text-2xl font-semibold text-white/40 uppercase tracking-widest mb-4 3xl:mb-8">
                        Kutish navbati ({waiting.length})
                    </h2>

                    {waiting.length === 0 ? (
                        <div className="glass p-12 3xl:p-24 text-center flex flex-col items-center justify-center">
                            <CheckCircle className="w-16 h-16 3xl:w-24 3xl:h-24 text-emerald-500/40 mb-4 3xl:mb-8" />
                            <p className="text-white/30 3xl:text-3xl">Barcha xizmat ko'rdi</p>
                        </div>
                    ) : (
                        <div className="space-y-2 3xl:space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {waiting.map((entry, idx) => (
                                <div
                                    key={entry._id}
                                    className={`glass flex items-center gap-4 3xl:gap-8 p-4 3xl:p-6 transition-all duration-300 animate-fade-in ${idx === 0 ? 'border border-amber-500/30 bg-amber-500/5' : ''}`}
                                >
                                    <div className={`w-12 h-12 3xl:w-20 3xl:h-20 rounded-xl 3xl:rounded-2xl flex items-center justify-center font-bold text-base 3xl:text-3xl flex-shrink-0 ${idx === 0 ? 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20' : 'bg-dark-700'}`}>
                                        #{entry.queueNumber}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-semibold 3xl:text-3xl ${idx === 0 ? 'text-amber-300' : 'text-white/80'}`}>{entry.name}</p>
                                        <p className="text-xs 3xl:text-xl text-white/30 mt-1">{idx === 0 ? 'Keyinchi!' : `${idx + 1}-o'rinda`}</p>
                                    </div>
                                    {idx === 0 && (
                                        <span className="text-xs 3xl:text-xl text-amber-400 font-medium animate-pulse 3xl:px-4 3xl:py-2">▶ Navbat</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
