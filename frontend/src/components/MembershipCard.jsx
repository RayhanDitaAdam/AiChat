import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { motion as Motion } from 'framer-motion';
import { Award, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';
import UserAvatar from './UserAvatar.jsx';

const MembershipCard = ({ user }) => {
    if (!user || user.role !== 'USER') return null;

    return (
        <Motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative w-full aspect-[1.58/1] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 cursor-pointer bg-zinc-950"
        >
            {/* Content Container */}
            <div className="relative h-full w-full p-5 md:p-8 flex flex-col justify-between z-10">

                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/5 backdrop-blur-2xl rounded-xl flex items-center justify-center border border-white/10 shadow-2xl transition-transform">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-white uppercase italic">
                                {user.memberOf?.name || 'HEART'}
                            </h2>
                        </div>

                        {/* Platinum Badge: Solid Minimalist Look */}
                        <div className="inline-flex items-center px-4 py-1.5 bg-slate-200 rounded-full border border-white/10">
                            <Award className="w-3 h-3 text-slate-900 mr-1.5" />
                            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.1em]">Platinum Elite Member</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 opacity-60">
                        <ShieldCheck className="w-6 h-6 text-white/40" />
                        <span className="text-[7px] font-bold uppercase tracking-[0.2em] vertical-text">Verified Card</span>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-end gap-4">
                    <div className="flex items-end gap-4">
                        <div className="hidden md:block mb-1">
                            <UserAvatar user={user} size={64} className="border-2 border-white/10 shadow-lg" />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em]">Identity</p>
                                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight capitalize border-b border-white/10 pb-1 w-fit">
                                    {user.name || 'Resident Member'}
                                </h3>
                            </div>

                            <div className="flex gap-6">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em]">Member ID</p>
                                    <p className="text-[10px] md:text-xs font-mono text-white tracking-[0.2em] font-medium italic opacity-90">
                                        {user.customerId || 'HEART-0X-XXXX'}
                                    </p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em]">Valid Thru</p>
                                    <p className="text-[10px] md:text-xs font-mono text-white tracking-[0.2em] font-medium opacity-90">
                                        12 / 99
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex items-center gap-3">
                        <div className="hidden md:block p-1 bg-white rounded-lg shadow-xl opacity-80 hover:opacity-100 transition-opacity">
                            <Barcode
                                value={user.customerId || 'HEART-MEMBER'}
                                width={0.8}
                                height={35}
                                fontSize={6}
                                margin={2}
                                background="transparent"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 blur-md rounded-2xl" />
                            <div className="relative p-2 bg-white rounded-xl shadow-2xl transition-transform duration-500">
                                <QRCodeSVG
                                    value={user.customerId || 'HEART-MEMBER'}
                                    size={60}
                                    fgColor="#000000"
                                    level="H"
                                    marginSize={1}
                                />
                            </div>
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
