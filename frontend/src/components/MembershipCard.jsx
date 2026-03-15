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
            className="relative w-[380px] h-[230px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 text-white p-6 flex flex-col justify-between group cursor-pointer"
        >
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-semibold tracking-[0.2em] opacity-80 uppercase">
                    Membership Card
                </span>
                <Sparkles className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Customer Info Section */}
            <div className="flex flex-col gap-1">
                <p className="text-[10px] font-medium opacity-60 uppercase tracking-widest">Customer Name</p>
                <h3 className="text-lg font-semibold tracking-tight uppercase">
                    {user.name || 'Resident Member'}
                </h3>
                <div className="mt-1">
                    <p className="text-[10px] font-medium opacity-60 uppercase tracking-widest">Customer ID</p>
                    <p className="text-sm font-mono opacity-80 tracking-wider">
                        {user.customerId || 'CUST-000000'}
                    </p>
                </div>
            </div>

            {/* Barcode Section */}
            <div className="mt-4 bg-white/95 rounded-lg p-2 flex items-center justify-center">
                <div className="w-full flex justify-center">
                    <Barcode
                        value={user.customerId || 'CUST-000000'}
                        width={1.5}
                        height={40}
                        fontSize={10}
                        margin={0}
                        background="transparent"
                        displayValue={false}
                    />
                </div>
            </div>

            {/* Subtle Overlay Effect */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/[0.03] skew-x-[-20deg] translate-x-1/2 pointer-events-none" />
        </Motion.div>
    );
};

export default MembershipCard;
