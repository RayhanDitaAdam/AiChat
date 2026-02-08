import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const MemberCard = React.forwardRef(({ member }, ref) => {
    if (!member) return null;

    return (
        <div ref={ref} className="print-area hidden print:block bg-white border border-slate-200 w-[400px] p-8 rounded-[2.5rem] text-slate-900 mx-auto mt-10 shadow-2xl font-sans">
            <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-4xl font-black mb-6 rotate-3 shadow-lg shadow-indigo-600/20">
                    {member.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-1 text-slate-900 italic">{member.name}</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Premium Loyalty Member</p>

                <div className="bg-white p-6 border-2 border-slate-50 rounded-[2rem] mb-10 shadow-xl shadow-slate-200/50">
                    <QRCodeSVG value={JSON.stringify({ id: member.id, name: member.name })} size={160} bgColor="#FFFFFF" fgColor="#000000" level="H" includeMargin={false} />
                </div>

                <div className="w-full text-center space-y-2 mb-8">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Membership Identifier</p>
                    <p className="font-mono text-sm font-bold text-slate-600">{member.id.toUpperCase()}</p>
                </div>

                <div className="w-full text-center space-y-2">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Current Points</p>
                    <p className="text-3xl font-black text-indigo-600 italic tracking-tighter">{member.points} PTS</p>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 w-full text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Heart Retail Intelligence</p>
                </div>
            </div>
        </div>
    );
});

MemberCard.displayName = 'MemberCard';

export default MemberCard;
