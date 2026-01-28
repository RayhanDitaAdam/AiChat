import React, { useState, useEffect, useRef } from 'react';
import {
    Bot, User, Star, MapPin, BadgeCheck, Bell,
    ArrowUp, History
} from 'lucide-react';
import { sendMessage, addRating, addReminder } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/Button.jsx';
import { motion as Motion } from 'framer-motion';

const ChatView = () => {
    const { user, isAuthenticated } = useAuth();
    const [messages, setMessages] = useState([]);
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
        // If owner is chatting, use their own ownerId. Else use default test ID.
        const targetOwnerId = user?.role === 'OWNER' ? user.ownerId : "7386cd43-7d53-49bf-bd04-9944bae9aeff";

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const data = await sendMessage(userMessage, targetOwnerId, user.id);
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

    const handleRating = async (idx, score) => {
        const targetOwnerId = user?.role === 'OWNER' ? user.ownerId : "7386cd43-7d53-49bf-bd04-9944bae9aeff";

        // Update local state first for instant feedback
        setMessages(prev => prev.map((m, i) => i === idx ? { ...m, selectedRating: score } : m));

        try {
            await addRating({ ownerId: targetOwnerId, score, feedback: 'User rated via quick buttons' });
        } catch {
            console.error('Rating failed');
        }
    };

    const handleSetReminder = async (productName) => {
        try {
            const remindDate = new Date(Date.now() + 86400000).toISOString();
            await addReminder({ product: productName, remindDate });
            setMessages(prev => [...prev, { role: 'ai', content: `Siap! Saya akan ingatkan kamu tentang ${productName} besok. ✅` }]);
        } catch {
            console.error('Reminder failed');
        }
    };

    return (
        <div className="flex flex-col h-full relative bg-white text-zinc-800">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-zinc-900">Heart</span>
                    <span className="text-[10px] text-zinc-400 font-bold ml-1">v.2</span>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                            <div className="w-16 h-16 bg-white border border-zinc-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <Bot className="w-10 h-10 text-zinc-800" />
                            </div>
                            <h2 className="text-3xl font-semibold mb-2 text-zinc-900">What’s on your mind today?</h2>
                            <p className="text-zinc-400">Ask Heart anything about our products or services. 🍎</p>
                        </div>
                    )}

                    {messages.map((m, idx) => (
                        m.role === 'ai' && idx === 0 && messages.length === 1 ? null : (
                            <Motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={idx}
                                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${m.role === 'user' ? 'bg-[#f4f4f4] border-zinc-200' : 'bg-indigo-600 border-indigo-500'}`}>
                                        {m.role === 'user' ? <User className="w-5 h-5 text-zinc-600" /> : <Bot className="w-5 h-5 text-white" />}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="py-2 px-1">
                                            <p className="text-base leading-relaxed whitespace-pre-wrap text-zinc-700">
                                                {m.content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                                    if (part.startsWith('**') && part.endsWith('**')) {
                                                        return <strong key={i} className="font-bold text-zinc-900">{part.slice(2, -2)}</strong>;
                                                    }
                                                    return part;
                                                })}
                                            </p>
                                        </div>

                                        {m.products && m.products.length > 0 && (
                                            <div className="grid grid-cols-1 gap-3 mt-4 w-full">
                                                {m.products.map((p, pIdx) => (
                                                    <div key={pIdx} className="bg-[#fcfcfc] rounded-2xl p-4 border border-zinc-100 hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-zinc-800">{p.name}</h4>
                                                                <p className="text-indigo-600 font-medium">Rp {p.price?.toLocaleString('id-ID')}</p>
                                                            </div>
                                                            {p.halal && <BadgeCheck className="w-5 h-5 text-green-500" />}
                                                        </div>
                                                        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>Lorong {p.aisle} • Bagian {p.section}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleSetReminder(p.name)}
                                                            className="mt-4 w-full py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-zinc-100"
                                                        >
                                                            <Bell className="w-4 h-4" /> Remind Me
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {m.ratingPrompt && user?.role === 'USER' && (
                                            <div className="mt-4 pt-4 border-t border-zinc-100">
                                                <p className="text-xs text-zinc-400 mb-2">{m.ratingPrompt}</p>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleRating(idx, s)}
                                                            className={`w-8 h-8 rounded-lg hover:bg-zinc-50 flex items-center justify-center transition-colors ${(m.selectedRating || 0) >= s ? 'text-amber-400' : 'text-zinc-300 hover:text-amber-500'
                                                                }`}
                                                        >
                                                            <Star className={`w-4 h-4 ${(m.selectedRating || 0) >= s ? 'fill-current' : ''}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Motion.div>
                        )
                    ))}
                    {isLoading && (
                        <div className="flex justify-start gap-4">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="flex gap-1.5 items-center p-2">
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-20" />
                </div>
            </main>

            {/* Input Area */}
            <footer className="w-full shrink-0 bg-gradient-to-t from-white via-white to-transparent pt-10">
                <div className="max-w-3xl mx-auto px-4 pb-8">
                    <div className="relative bg-[#f4f4f4] rounded-[26px] border border-zinc-200/50 shadow-sm focus-within:border-zinc-300 focus-within:bg-white transition-all">
                        <textarea
                            rows="1"
                            className="w-full bg-transparent border-none focus:ring-0 text-zinc-800 py-3.5 pl-5 pr-14 resize-none max-h-52 custom-scrollbar outline-none font-medium placeholder:text-zinc-400"
                            placeholder="Message Heart"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <div className="absolute right-2 bottom-2">
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`p-2 rounded-full transition-all ${!input.trim() || isLoading ? 'bg-zinc-100 text-zinc-500' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
                            >
                                <ArrowUp className="w-5 h-5" strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ChatView;
