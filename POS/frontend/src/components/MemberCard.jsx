import React from 'react';
import QRCode from 'react-qr-code';

const MemberCard = React.forwardRef(({ member }, ref) => {
    if (!member) return null;

    return (
        <div ref={ref} className="print-area hidden print:block bg-white border border-black w-[350px] p-6 rounded-lg text-black mx-auto mt-10 shadow-none">
            <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-4">
                    {member.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-xl font-bold uppercase tracking-tight mb-1">{member.name}</h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Premium Member</p>

                <div className="bg-white p-4 border border-black rounded-lg mb-6">
                    <QRCode value={JSON.stringify({ id: member.id, name: member.name })} size={120} bgColor="#FFFFFF" fgColor="#000000" />
                </div>

                <div className="w-full text-center space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member ID</p>
                    <p className="font-mono text-xs">{member.id.toUpperCase()}</p>
                </div>

                <div className="w-full text-center space-y-1 mt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Points Balance</p>
                    <p className="text-2xl font-bold">{member.points} PTS</p>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200 w-full text-center">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Heart Retail Intelligence</p>
                </div>
            </div>
        </div>
    );
});

export default MemberCard;
