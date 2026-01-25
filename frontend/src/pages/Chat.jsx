import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { sendMessage } from '../services/api.js';
import MainLayout from '../layouts/MainLayout.jsx';

const Chat = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Halo! Saya HEART v.1. Ada yang bisa saya bantu cari hari ini? (Hello! I am HEART v.1. Anything I can help you find today?)' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const data = await sendMessage(
                userMessage,
                '00000000-0000-0000-0000-000000000000',
                '00000000-0000-0000-0000-000000000000'
            );
            setMessages(prev => [...prev, { role: 'ai', content: data.message }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'ai', content: 'Maaf, terjadi kesalahan koneksi. (Sorry, there was a connection error.)' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col h-screen max-w-4xl mx-auto border-x border-slate-200 bg-white">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-100 p-4 z-10 flex items-center justify-between">
                    <h1 className="font-bold text-indigo-600 text-xl flex items-center gap-2">
                        <Bot className="w-6 h-6" /> HEART v.1
                    </h1>
                    <div className="flex gap-2">
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Gemini Powered</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                    {messages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${m.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                                }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex gap-2">
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 bg-white border-t border-slate-100">
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:border-indigo-500 transition-all">
                        <input
                            type="text"
                            className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none"
                            placeholder="Tanya sayur kol..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </footer>
            </div>
        </MainLayout>
    );
};

export default Chat;
