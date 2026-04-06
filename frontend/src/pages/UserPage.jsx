import React, { useState, useEffect } from 'react';
import { addToQueue, getQueue } from '../services/api';
import socket from '../services/socket';
import QueueCard from '../components/QueueCard';
import { Link } from 'react-router-dom';
import { CENTERS, getCenterById } from '../data/centers';
import { Download, Ticket, CheckCircle, ArrowLeft, ArrowRight, Loader, Inbox, Clock, Ban } from 'lucide-react';
import html2canvas from 'html2canvas';

// Phone number formatter: +998 XX XXX XX XX
function formatPhone(raw) {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('998')) {
        digits = digits.slice(3);
    }
    digits = digits.slice(0, 9);

    if (digits.length === 0) return '+998 ';

    let result = '+998 ';
    if (digits.length > 0) result += digits.slice(0, 2);
    if (digits.length >= 3) result += ' ' + digits.slice(2, 5);
    if (digits.length >= 6) result += ' ' + digits.slice(5, 7);
    if (digits.length >= 8) result += ' ' + digits.slice(7, 9);

    return result;
}

const STEPS = ['Markaz', 'Ma\'lumot'];

export default function UserPage() {
    const [step, setStep] = useState(1);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [selectedDept, setSelectedDept] = useState(null);
    const [form, setForm] = useState({ name: '', phone: '+998 ', age: '', gender: '', complaint: '' });
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [myEntry, setMyEntry] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        getQueue().then(res => setQueue(res.data)).catch(console.error);
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('queue:updated', (data) => {
            setQueue(data);
            if (myEntry) {
                const updated = data.find(e => e._id === myEntry._id);
                if (updated) setMyEntry(updated);
            }
        });
        setConnected(socket.connected);
        return () => {
            socket.off('queue:updated');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [myEntry]);

    const handlePhoneChange = (e) => {
        setForm(f => ({ ...f, phone: formatPhone(e.target.value) }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Ism-familiya kiritilishi shart';
        const digits = form.phone.replace(/\D/g, '');
        if (digits.length < 12) errs.phone = 'To\'liq telefon raqam kiriting (+998 XX XXX XX XX)';
        if (!form.age) errs.age = 'Yosh kiritilishi shart';
        else if (Number(form.age) < 18) errs.age = 'Yosh kamida 18 bo\'lishi kerak';
        if (!form.gender) errs.gender = 'Jins tanlanishi shart';
        if (!form.complaint.trim()) errs.complaint = 'Shikoyat kiritilishi shart';
        else if (form.complaint.trim().length < 10) errs.complaint = 'Shikoyat kamida 10 ta harf bo\'lishi kerak';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        try {
            const payload = {
                center: getCenterById(selectedCenter)?.name,
                department: getCenterById(selectedCenter)?.departments.find(d => d.id === selectedDept)?.name,
                name: form.name.trim(),
                phone: form.phone,
                age: Number(form.age),
                gender: form.gender,
                complaint: form.complaint.trim(),
            };
            const res = await addToQueue(payload);
            setMyEntry(res.data);
            setSubmitted(true);
        } catch (err) {
            setErrors({ server: err.response?.data?.message || 'Server xatosi. Qayta urinib ko\'ring.' });
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep(1); setSelectedCenter(null); setSelectedDept(null);
        setForm({ name: '', phone: '+998 ', age: '', gender: '', complaint: '' });
        setErrors({}); setSubmitted(false); setMyEntry(null);
    };

    const handleDownloadTicket = async () => {
        const ticketElement = document.getElementById('ticket-card');
        if (!ticketElement) return;

        try {
            const canvas = await html2canvas(ticketElement, {
                backgroundColor: '#1E1E1E', // Dark background for better match
                scale: 2 // High resolution
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `Navbat_Chiptasi_${myEntry?.queueNumber || '1'}.png`;
            link.click();
        } catch (err) {
            console.error('Error downloading ticket', err);
        }
    };

    const centerData = getCenterById(selectedCenter);
    const statusLabels = { pending: 'Tasdiqlanmagan (Kutilmoqda)', waiting: 'Tasdiqlangan (Kutmoqda)', serving: 'Xizmatda', done: 'Tugadi', rejected: 'Rad etildi' };
    const myPosition = myEntry ? queue.findIndex(e => e._id === myEntry._id) + 1 : null;

    return (
        <div className="min-h-screen bg-dark-900 bg-grid">
            {/* Header */}
            <header className="border-b border-white/5 bg-dark-800/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Multi-Center" className="h-16 sm:h-20 w-auto animate-bounce-in drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] object-contain" />
                        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <h1 className="font-bold text-white text-lg leading-tight hidden text-[0] sm:block sm:text-lg">Navbat Tizimi</h1>
                            <p className="text-xs text-white/40 hidden sm:block">Onlayn navbat xizmati</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                            {connected ? 'Jonli' : 'Ulanmoqda...'}
                        </span>
                        <Link to="/admin" className="text-sm text-white/40 hover:text-white/70 transition-colors">Admin →</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {submitted ? (
                    /* ── My Ticket ── */
                    <div className="max-w-md mx-auto animate-slide-up space-y-4">
                        <div id="ticket-card" className="card glow-emerald text-center relative overflow-hidden bg-dark-800 p-8 rounded-3xl">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">Muvaffaqiyat!</h2>
                            <p className="text-white/40 text-sm mb-6">Navbatga muvaffaqiyatli yozildingiz</p>
                            {myEntry && (
                                <div className="space-y-4">
                                    <div className="queue-number">#{myEntry.queueNumber}</div>
                                    <p className="text-white/60 text-sm">Sizning navbat raqamingiz</p>
                                    <div className="glass p-4 text-left space-y-2.5">
                                        {[
                                            ['Markaz', myEntry.center],
                                            ['Bo\'lim', myEntry.department],
                                            ['Ism', myEntry.name],
                                            ['Telefon', myEntry.phone],
                                            ['Yosh', `${myEntry.age} yosh`],
                                            ['Jins', myEntry.gender === 'male' ? 'Erkak' : 'Ayol'],
                                            ['Holat', statusLabels[myEntry.status]],
                                            ...(myPosition && (myEntry.status === 'waiting' || myEntry.status === 'pending') ? [['Pozitsiya', `${myPosition}-o'rin`]] : []),
                                            ...(myEntry.status === 'waiting' && myEntry.assignedDate ? [['Belgilangan sana', myEntry.assignedDate]] : []),
                                            ...(myEntry.status === 'waiting' && myEntry.assignedTime ? [['Belgilangan vaqt', myEntry.assignedTime]] : []),
                                        ].map(([label, val]) => (
                                            <div key={label} className="flex justify-between border-b last:border-0 border-white/5 pb-2">
                                                <span className="text-white/40 text-sm">{label}</span>
                                                <span className={`font-medium text-sm text-right ${label === 'Holat' ? (myEntry.status === 'serving' ? 'text-blue-400' : myEntry.status === 'done' ? 'text-emerald-400' : myEntry.status === 'pending' ? 'text-gray-400' : myEntry.status === 'rejected' ? 'text-red-400' : 'text-amber-400') : (label === 'Belgilangan vaqt' || label === 'Belgilangan sana') ? 'text-emerald-400' : 'text-white'}`}>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="glass p-3 text-left">
                                        <p className="text-white/40 text-xs mb-1">Shikoyat</p>
                                        <p className="text-white/80 text-sm">{myEntry.complaint}</p>
                                    </div>
                                    {myEntry.status === 'pending' && (
                                        <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded-xl text-gray-400 text-sm font-medium flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Admin tasdiqlashi kutilmoqda.
                                        </div>
                                    )}
                                    {myEntry.status === 'rejected' && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2">
                                            <Ban className="w-4 h-4" /> Arizangiz rad etildi.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Download & New flow actions */}
                        <div className="flex flex-col gap-3">
                            <button onClick={handleDownloadTicket} className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/20">
                                <Download className="w-4 h-4" /> Chiptani yuklab olish (PNG)
                            </button>
                            <button onClick={reset} className="btn-secondary w-full text-sm">Orqaga qaytish</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left column: step form */}
                        <div className="lg:col-span-2 animate-slide-up">
                            {/* Step progress bar */}
                            <div className="flex items-center gap-3 mb-8">
                                {STEPS.map((s, i) => {
                                    const stepNum = i + 1;
                                    const isActive = step === stepNum;
                                    const isDone = step > stepNum;
                                    return (
                                        <React.Fragment key={s}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-dark-700 text-white/30'}`}>
                                                    {isDone ? '✓' : stepNum}
                                                </div>
                                                <span className={`font-medium text-sm ${isActive ? 'text-white' : isDone ? 'text-emerald-400' : 'text-white/30'}`}>{s}</span>
                                            </div>
                                            {i < STEPS.length - 1 && (
                                                <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step > stepNum ? 'bg-emerald-500' : 'bg-dark-700'}`} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* ── STEP 1: Center + Department ── */}
                            {step === 1 && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* If no center selected — show centers grid */}
                                    {!selectedCenter ? (
                                        <>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">Markazni tanlang</h2>
                                                <p className="text-white/40 mt-1 text-sm">Xizmat olmoqchi bo'lgan markazni tanlang</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {CENTERS.map(center => (
                                                    <button
                                                        key={center.id}
                                                        onClick={() => setSelectedCenter(center.id)}
                                                        className="glass p-5 text-left hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
                                                    >
                                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${center.color} flex items-center justify-center text-2xl shadow-lg ${center.shadow} mb-3 group-hover:scale-110 transition-transform`}>
                                                            {center.icon}
                                                        </div>
                                                        <p className="font-semibold text-white">{center.name}</p>
                                                        <p className="text-xs text-white/40 mt-1">{center.departments.length} ta bo'lim</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        /* Department selection */
                                        <>
                                            <div>
                                                <button onClick={() => { setSelectedCenter(null); setSelectedDept(null); }} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-4">
                                                    ← Markazlar
                                                </button>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${centerData.color} flex items-center justify-center text-xl shadow-lg ${centerData.shadow}`}>
                                                        {centerData.icon}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold text-white">{centerData.name}</h2>
                                                        <p className="text-white/40 text-sm">Bo'lim tanlang</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {centerData.departments.map(dept => (
                                                    <button
                                                        key={dept.id}
                                                        onClick={() => {
                                                            setSelectedDept(dept.id);
                                                            setStep(2);
                                                        }}
                                                        className={`glass p-4 text-left flex items-center gap-3 hover:bg-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 ${selectedDept === dept.id ? `border ${centerData.border}` : ''}`}
                                                    >
                                                        <span className="text-2xl">{dept.icon}</span>
                                                        <span className="font-medium text-white text-sm">{dept.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ── STEP 2: Personal Info ── */}
                            {step === 2 && (
                                <div className="animate-fade-in">
                                    <div className="mb-6">
                                        <button onClick={() => setStep(1)} className="text-white/50 hover:text-white transition-colors text-sm mb-3 flex items-center gap-1">
                                            ← Orqaga
                                        </button>
                                        {/* Selected path summary */}
                                        <div className={`glass p-3 flex items-center gap-3 mb-6 border ${centerData?.border}`}>
                                            <span className="text-xl">{centerData?.icon}</span>
                                            <div>
                                                <p className="text-xs text-white/40">Tanlangan xizmat</p>
                                                <p className="font-medium text-white text-sm">{centerData?.name} → {centerData?.departments.find(d => d.id === selectedDept)?.icon} {centerData?.departments.find(d => d.id === selectedDept)?.name}</p>
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">Shaxsiy ma'lumotlar</h2>
                                        <p className="text-white/40 mt-1 text-sm">Barcha maydonlarni to'liq to'ldiring</p>
                                    </div>

                                    {errors.server && (
                                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{errors.server}</div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">Ism-familiya</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                className={`input-field ${errors.name ? 'border-red-500/50 focus:border-red-500' : ''}`}
                                            />
                                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">Telefon raqami</label>
                                            <input
                                                type="tel"
                                                placeholder="+998 90 123 45 67"
                                                value={form.phone}
                                                onChange={handlePhoneChange}
                                                className={`input-field font-mono tracking-wide ${errors.phone ? 'border-red-500/50 focus:border-red-500' : ''}`}
                                            />
                                            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                                        </div>

                                        {/* Age + Gender row */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-white/60 mb-2">Yosh <span className="text-white/30">(18+)</span></label>
                                                <input
                                                    type="number"
                                                    placeholder="18"
                                                    min="18"
                                                    value={form.age}
                                                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                                                    className={`input-field ${errors.age ? 'border-red-500/50 focus:border-red-500' : ''}`}
                                                />
                                                {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/60 mb-2">Jins</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[{ val: 'male', label: '👨 Erkak' }, { val: 'female', label: '👩 Ayol' }].map(g => (
                                                        <button
                                                            key={g.val}
                                                            type="button"
                                                            onClick={() => setForm(f => ({ ...f, gender: g.val }))}
                                                            className={`py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${form.gender === g.val ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-dark-700 border-white/10 text-white/50 hover:text-white hover:border-white/20'}`}
                                                        >
                                                            {g.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
                                            </div>
                                        </div>

                                        {/* Complaint */}
                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">
                                                Shikoyat / muammo haqida qisqacha
                                                <span className="text-white/30 ml-2">{form.complaint.length}/500</span>
                                            </label>
                                            <textarea
                                                rows={4}
                                                placeholder="Muammongiz haqida qisqacha yozing (kamida 10 ta harf)..."
                                                value={form.complaint}
                                                maxLength={500}
                                                onChange={e => setForm(f => ({ ...f, complaint: e.target.value }))}
                                                className={`input-field resize-none ${errors.complaint ? 'border-red-500/50 focus:border-red-500' : ''}`}
                                            />
                                            {errors.complaint && <p className="text-red-400 text-xs mt-1">{errors.complaint}</p>}
                                        </div>

                                        <button type="submit" className="btn-primary w-full" disabled={loading}>
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Saqlanmoqda...
                                                </span>
                                            ) : '🎫 Navbat olish'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Right: Live queue sidebar */}
                        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-white">Joriy navbat</h2>
                                <Link to="/display" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Ekran ↗</Link>
                            </div>
                            {queue.length === 0 ? (
                                <div className="glass p-10 text-center flex flex-col items-center">
                                    <Inbox className="w-10 h-10 text-white/20 mb-3" />
                                    <p className="text-white/40 text-sm">Navbat bo'sh</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                                    {queue.map((entry, idx) => (
                                        <QueueCard key={entry._id} entry={entry} position={idx + 1} isAdmin={false} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
