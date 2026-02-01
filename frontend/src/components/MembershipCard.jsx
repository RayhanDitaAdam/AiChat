import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion as Motion } from 'framer-motion';
import { Award, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';

const MembershipCard = ({ user }) => {
    if (!user || user.role !== 'USER') return null;

    return (
        <Motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative w-full aspect-[1.58/1] rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 cursor-pointer bg-zinc-950"
        >
            {/* Content Container */}
            <div className="relative h-full w-full p-8 md:p-12 flex flex-col justify-between z-10">

                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/5 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl transition-transform">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                                {user.memberOf?.name || 'HEART'}
                            </h2>
                        </div>

                        {/* Platinum Badge: Solid Minimalist Look */}
                        <div className="inline-flex items-center px-5 py-2 bg-slate-200 rounded-full border border-white/10">
                            <Award className="w-4 h-4 text-slate-900 mr-2" />
                            <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">Platinum Elite Member</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 opacity-60">
                        <ShieldCheck className="w-8 h-8 text-white/40" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] vertical-text">Verified Card</span>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-end gap-8">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Identity</p>
                            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight capitalize border-b-2 border-white/10 pb-2 w-fit">
                                {user.name || 'Resident Member'}
                            </h3>
                        </div>

                        <div className="flex gap-8">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em]">Member ID</p>
                                <p className="text-sm font-mono text-white tracking-[0.4em] font-medium italic opacity-90">
                                    {user.customerId || 'HEART-0X-XXXX'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em]">Valid Thru</p>
                                <p className="text-sm font-mono text-white tracking-[0.4em] font-medium opacity-90">
                                    12 / 99
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-md rounded-3xl" />
                        <div className="relative p-2.5 bg-white rounded-2xl shadow-2xl transition-transform duration-500">
                            <QRCodeSVG
                                value={user.customerId || 'HEART-MEMBER'}
                                size={90}
                                fgColor="#000000"
                                level="H"
                                marginSize={1}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Minimal Background Element */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/[0.02] pointer-events-none" />
        </Motion.div>
    );
};

export default MembershipCard;
