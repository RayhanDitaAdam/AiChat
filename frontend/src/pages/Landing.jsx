import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MessageSquare, Star, Bell } from 'lucide-react';
import Button from '../components/Button.jsx';
import MainLayout from '../layouts/MainLayout.jsx';

const Landing = () => {
    return (
        <MainLayout>
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-slate-50">
                <div className="max-w-2xl w-full bg-white/80 backdrop-blur-md p-10 rounded-[2rem] shadow-xl border border-white/50 text-center">
                    <div className="inline-flex p-3 bg-indigo-600 rounded-2xl mb-6 shadow-lg shadow-indigo-200">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Welcome to HEART v.1</h1>
                    <p className="text-slate-500 text-lg mb-8">AI Shopping Assistant yang cerdas, cepat, dan siap membantu belanja kamu!</p>

                    <div className="grid gap-6 text-left mb-10">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <MessageSquare className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">1. Chat & Tanya</h3>
                                <p className="text-sm text-slate-500">Tanyakan produk apa saja yang kamu cari lewat chat.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <ShoppingBag className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">2. Info Produk Akurat</h3>
                                <p className="text-sm text-slate-500">Dapatkan informasi harga, lokasi rak, dan ketersediaan.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <Bell className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">3. Pengingat Otomatis</h3>
                                <p className="text-sm text-slate-500">Pasang reminder untuk produk yang habis atau akan dibeli.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <Star className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">4. Beri Penilaian</h3>
                                <p className="text-sm text-slate-500">Berikan feedback agar kami bisa terus melayani lebih baik.</p>
                            </div>
                        </div>
                    </div>

                    <Link to="/chat">
                        <Button className="bg-indigo-600 text-white w-full hover:bg-indigo-700">
                            Mulai Chat Sekarang
                        </Button>
                    </Link>

                    <p className="mt-8 text-slate-400 text-sm">
                        Bilingual Support (ID/EN) • Aman & Terpercaya
                    </p>
                </div>
            </div>
        </MainLayout>
    );
};

export default Landing;
