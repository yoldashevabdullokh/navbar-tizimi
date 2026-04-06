import React, { useState, useEffect } from 'react';
import { getQueue, updateStatus, deleteEntry, approveQueue, rejectQueue } from '../services/api';
import socket from '../services/socket';
import QueueCard from '../components/QueueCard';
import { Link } from 'react-router-dom';
import { CENTERS } from '../data/centers';
import { Lock, Inbox, List, Clock, Play, CheckCircle, Info, Trash, Ban } from 'lucide-react';

const ADMIN_PIN = '1234';

export default function AdminPage() {
    const [queue, setQueue] = useState([]);
    const [pin, setPin] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [pinError, setPinError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [connected, setConnected] = useState(false);
    const [notification, setNotification] = useState('');
    const [approvingEntry, setApprovingEntry] = useState(null);
    const [assignDate, setAssignDate] = useState('');
    const [assignTime, setAssignTime] = useState('');

    useEffect(() => {
        if (!authenticated) return;
        getQueue().then(res => setQueue(res.data)).catch(console.error);
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('queue:updated', setQueue);
        setConnected(socket.connected);
        return () => {
            socket.off('queue:updated');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [authenticated]);

    const showNotif = (msg) => { setNotification(msg); setTimeout(() => setNotification(''), 3000); };

    const handleAuth = (e) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) { setAuthenticated(true); setPinError(''); }
        else { setPinError('PIN noto\'g\'ri. Qayta urinib ko\'ring.'); setPin(''); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateStatus(id, status);
            showNotif(status === 'serving' ? 'Xizmatga olindi' : 'Bajarildi!');
        } catch { showNotif('Xatolik yuz berdi'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Haqiqatan o\'chirmoqchimisiz?')) return;
        try { await deleteEntry(id); showNotif('Karta o\'chirildi'); }
        catch { showNotif('Xatolik yuz berdi'); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Haqiqatan rad etmoqchimisiz?')) return;
        try { await rejectQueue(id); showNotif('Rad etildi'); }
        catch { showNotif('Xatolik yuz berdi'); }
    };

    const submitApprove = async (e) => {
        e.preventDefault();
        if (!assignDate || !assignTime) return showNotif('Sana va vaqt kiriting!');
        try {
            await approveQueue(approvingEntry._id, assignDate, assignTime);
            showNotif('Tasdiqlandi, vaqt belgilandi.');
            setApprovingEntry(null);
            setAssignDate('');
            setAssignTime('');
        } catch {
            showNotif('Xatolik yuz berdi');
        }
    };

    // Unique departments in current queue
    const activeDepartments = [...new Set(queue.map(e => e.department).filter(Boolean))];

    const filtered = queue.filter(e => {
        const statusOk = statusFilter === 'all' || e.status === statusFilter;
        const deptOk = departmentFilter === 'all' || e.department === departmentFilter;
        return statusOk && deptOk;
    });

    const stats = {
        total: queue.length,
        pending: queue.filter(e => e.status === 'pending').length,
        waiting: queue.filter(e => e.status === 'waiting').length,
        serving: queue.filter(e => e.status === 'serving').length,
        done: queue.filter(e => e.status === 'done').length,
    };

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-4">
                <div className="card w-full max-w-sm text-center animate-slide-up glow-blue border-blue-500/20">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Admin Paneli</h1>
                    <p className="text-white/40 text-sm mb-6">Kirish uchun PIN kodni kiriting</p>
                    {pinError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{pinError}</div>}
                    <form onSubmit={handleAuth} className="space-y-4">
                        <input type="password" placeholder="••••" value={pin} onChange={e => setPin(e.target.value)} maxLength={6} className="input-field text-center text-xl tracking-widest" autoFocus />
                        <button type="submit" className="btn-primary w-full">Kirish</button>
                    </form>
                    <p className="text-white/20 text-xs mt-4">Default PIN: 1234</p>
                    <Link to="/" className="block mt-4 text-sm text-white/40 hover:text-white/70 transition-colors">← Foydalanuvchi sahifasiga</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 bg-grid">
            {/* Notifications */}
            {notification && (
                <div className="fixed bottom-6 right-6 bg-dark-800 border border-white/10 text-white px-5 py-3 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-slide-up z-50">
                    <Info className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-sm">{notification}</span>
                </div>
            )}

            {/* Header */}
            <header className="border-b border-white/5 bg-dark-800/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Multi-Center" className="h-16 sm:h-20 w-auto animate-bounce-in drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] object-contain" />
                        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <h1 className="font-bold text-white leading-tight hidden sm:block">Admin Paneli</h1>
                            <p className="text-xs text-white/40 hidden sm:block">Navbatni boshqarish</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                            {connected ? 'Real-time' : 'Ulanmoqda...'}
                        </span>
                        <Link to="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">← Orqaga</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8 animate-slide-up">
                    {[
                        { label: 'Jami', value: stats.total, color: 'text-white', bg: 'from-dark-700 to-dark-600' },
                        { label: 'Yangi', value: stats.pending, color: 'text-gray-400', bg: 'from-gray-500/10 to-gray-600/5' },
                        { label: 'Kutmoqda', value: stats.waiting, color: 'text-amber-400', bg: 'from-amber-500/10 to-amber-600/5' },
                        { label: 'Xizmatda', value: stats.serving, color: 'text-blue-400', bg: 'from-blue-500/10 to-blue-600/5' },
                        { label: 'Tugadi', value: stats.done, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-emerald-600/5' },
                    ].map(s => (
                        <div key={s.label} className={`glass p-4 text-center bg-gradient-to-br ${s.bg}`}>
                            <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-white/40 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4 w-full">
                    {/* Status filter */}
                    <div className="flex gap-1.5 bg-dark-800 rounded-xl p-1 overflow-x-auto w-full sm:w-auto scrollbar-hide">
                        {[
                            { key: 'all', label: <span className="flex items-center gap-1.5"><List className="w-3.5 h-3.5" /> Barchasi</span> },
                            { key: 'pending', label: <span className="flex items-center gap-1.5 text-gray-300"><Info className="w-3.5 h-3.5" /> Yangi</span> },
                            { key: 'waiting', label: <span className="flex items-center gap-1.5 text-amber-300"><Clock className="w-3.5 h-3.5" /> Tasdiqlangan</span> },
                            { key: 'serving', label: <span className="flex items-center gap-1.5 text-blue-300"><Play className="w-3.5 h-3.5" /> Xizmatda</span> },
                            { key: 'done', label: <span className="flex items-center gap-1.5 text-emerald-300"><CheckCircle className="w-3.5 h-3.5" /> Tugadi</span> },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${statusFilter === f.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Department filter */}
                    {activeDepartments.length > 0 && (
                        <div className="flex gap-1.5 bg-dark-800 rounded-xl p-1 flex-wrap">
                            <button
                                onClick={() => setDepartmentFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${departmentFilter === 'all' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
                            >
                                Barcha bo'limlar
                            </button>
                            {activeDepartments.map(dept => {
                                // Add badge for pending in this dept
                                const pendingInDept = queue.filter(e => e.department === dept && e.status === 'pending').length;
                                return (
                                    <button
                                        key={dept}
                                        onClick={() => setDepartmentFilter(dept)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${departmentFilter === dept ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
                                    >
                                        {dept}
                                        {pendingInDept > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                                {pendingInDept}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Count */}
                <p className="text-white/30 text-xs mb-3">{filtered.length} ta yozuv ko'rsatilmoqda</p>

                {/* Queue list */}
                {filtered.length === 0 ? (
                    <div className="glass p-16 text-center animate-fade-in flex flex-col items-center justify-center">
                        <Inbox className="w-16 h-16 text-white/20 mb-4" />
                        <p className="text-white/40">Bu bo'limda hech kim yo'q</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((entry) => (
                            <QueueCard
                                key={entry._id}
                                entry={entry}
                                position={queue.indexOf(entry) + 1}
                                isAdmin={true}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                                onApproveClick={(e) => setApprovingEntry(e)}
                                onRejectClick={handleReject}
                            />
                        ))}
                    </div>
                )}

                {/* Approval Modal */}
                {approvingEntry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                        <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl w-full max-w-sm animate-fade-in shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-2">Navbatni Tasdiqlash</h3>
                            <p className="text-white/40 text-sm mb-6">Mijoz uchun kelish kuni va vaqtini belgilang.</p>

                            <form onSubmit={submitApprove} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">Sana</label>
                                    <input
                                        type="date"
                                        value={assignDate}
                                        onChange={e => setAssignDate(e.target.value)}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">Vaqt (Masalan: 14:00 - 15:00)</label>
                                    <input
                                        type="text"
                                        placeholder="14:00 - 15:00"
                                        value={assignTime}
                                        onChange={e => setAssignTime(e.target.value)}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-3 mt-6">
                                    <button type="button" onClick={() => setApprovingEntry(null)} className="btn-secondary flex-1 py-3 text-sm">Bekor qilish</button>
                                    <button type="submit" className="btn-primary flex-1 py-3 text-sm bg-blue-600">Tasdiqlash</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
