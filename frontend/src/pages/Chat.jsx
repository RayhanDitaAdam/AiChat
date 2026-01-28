
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Star, MapPin, BadgeCheck, Bell } from 'lucide-react';
import { sendMessage, addRating, addReminder } from '../services/api.js';
import MainLayout from '../layouts/MainLayout.jsx';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/Button.jsx';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
    const { user, isAuthenticated } = useAuth();
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Halo! Saya HEART v.1. Ada yang bisa saya bantu cari hari ini? 🍎' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !isAuthenticated) return;

        const userMessage = input.trim();
        const ownerId = "7386cd43-7d53-49bf-bd04-9944bae9aeff";

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const data = await sendMessage(userMessage, ownerId, user.id);
            setMessages(prev => [...prev, {
                role: 'ai',
                content: data.message,
                status: data.status,
                products: data.products,
                ratingPrompt: data.ratingPrompt
            }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', content: 'Koneksi lagi bermasalah nih bre. Coba lagi ya! 🙏' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRating = async (score) => {
        const ownerId = "7386cd43-7d53-49bf-bd04-9944bae9aeff";
        try {
            await addRating({ ownerId, score, feedback: 'User rated via quick buttons' });
            setMessages(prev => [...prev, { role: 'ai', content: 'Terima kasih ratingnya! (Thank you for the rating!)' }]);
        } catch {
            console.error('Rating failed');
        }
    };

    const handleSetReminder = async (productName) => {
        try {
            const remindDate = new Date(Date.now() + 86400000).toISOString();
            await addReminder({ product: productName, remindDate });
            setMessages(prev => [...prev, { role: 'ai', content: `Siap! Saya akan ingatkan kamu tentang ${ productName } besok. ✅` }]);
        } catch {
            console.error('Reminder failed');
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col h-[calc(100vh-160px)] max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100 relative z-20">
                <header className="bg-white border-b border-slate-50 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-sm border border-indigo-500">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-black text-slate-900 text-xl tracking-tight leading-none">HEART System</h1>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Assistant</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
                    <AnimatePresence>
                        {messages.map((m, idx) => (
                            <Motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={idx}
                                className={`flex ${ m.role === 'user' ? 'justify-end' : 'justify-start' } `}
                            >
                                <div className={`max - w - [80 %]`}>
                                    <div className={`p - 6 rounded - 3xl shadow - sm transition - colors ${
    m.role === 'user'
    ? 'bg-indigo-600 text-white rounded-tr-none'
    : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
} ${
    m.status === 'FOUND'
    ? 'border-green-100 bg-green-50/50'
    : m.status === 'NOT_FOUND'
        ? 'border-amber-100 bg-amber-50/50'
        : ''
} `}>
                                        <p className="text-base leading-relaxed font-bold whitespace-pre-wrap">{m.content}</p>

                                        {/* Products Grid */}
                                        {m.products && m.products.length > 0 && (
                                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {m.products.map((p, pIdx) => (
                                                    <div
                                                        key={pIdx}
                                                        className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h4 className="font-black text-slate-900 text-sm leading-tight">{p.name}</h4>
                                                            {p.halal && <BadgeCheck className="w-5 h-5 text-green-500" />}
                                                        </div>
                                                        <p className="text-indigo-600 font-black text-lg mb-4">Rp {p.price?.toLocaleString('id-ID')}</p>

                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            <div className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 text-[10px] font-black text-slate-400">
                                                                <MapPin className="w-3 h-3 text-rose-400" /> {p.aisle} • {p.section}
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => handleSetReminder(p.name)}
                                                            className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Bell className="w-3.5 h-3.5" /> Remind Me
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Rating Prompt Buttons */}
                                        {m.ratingPrompt && (
                                            <div className="mt-6 pt-6 border-t border-slate-200/50 space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{m.ratingPrompt}</p>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleRating(s)}
                                                            className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-300 hover:bg-amber-500 hover:text-white transition-colors border border-slate-100 shadow-sm"
                                                        >
                                                            <Star className="w-5 h-5 fill-current" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`mt - 3 text - [10px] font - black uppercase tracking - widest text - slate - 300 flex items - center gap - 2 ${ m.role === 'user' ? 'justify-end' : 'justify-start' } `}>
                                        {m.role === 'user' ? user?.name : 'AI ENGINE'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </Motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-50 px-6 py-4 rounded-[1.8rem] border border-slate-100 flex gap-2 items-center">
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-8 bg-white border-t border-slate-50">
                    <div className="flex gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-[2rem] focus-within:bg-white focus-within:border-indigo-100 transition-all duration-300">
                        <input
                            type="text"
                            className="flex-1 bg-transparent px-6 py-3 text-lg focus:outline-none placeholder:text-slate-300 font-bold text-slate-700"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </div>
                </footer>
            </div>
        </MainLayout>
    );
};

export default Chat;
