import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LogoLoop from './LogoLoop';
import { Store, ArrowUpRight } from 'lucide-react';

const StoreMarquee = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStores = async () => {
            try {
                console.log('[StoreMarquee] Fetching stores...');
                const response = await api.get('/public/owners/list?limit=5');
                console.log('[StoreMarquee] Response:', response.data);
                if (response.data.status === 'success') {
                    setStores(response.data.owners);
                }
            } catch (error) {
                console.error('[StoreMarquee] Failed to fetch stores:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, []);

    if (loading || stores.length === 0) return null;

    const marqueeItems = stores.map(store => ({
        id: store.id,
        name: store.name,
        domain: store.domain,
        businessCategory: store.businessCategory,
        // We render a custom node for each store
        node: (
            <div
                onClick={() => navigate(`/${store.domain}`)}
                className="cursor-target group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all duration-300"
            >
                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:scale-110 transition-all">
                    <Store className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-200 flex items-center gap-1">
                        {store.name}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{store.businessCategory || 'RETAIL'}</span>
                </div>
            </div>
        )
    }));

    return (
        <div className="w-full py-8 bg-zinc-950/20 backdrop-blur-sm border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Partner Network</span>
            </div>
            <LogoLoop
                logos={marqueeItems}
                speed={30}
                direction="left"
                logoHeight={60}
                gap={30}
                pauseOnHover
                fadeOut
                fadeOutColor="#020617"
            />
        </div>
    );
};

export default StoreMarquee;
