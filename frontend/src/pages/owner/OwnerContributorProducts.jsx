import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Package, User } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getPendingProducts, updateProductStatus } from '../../services/api';
import { PATHS } from '../../routes/paths';

const OwnerContributorProducts = () => {
    const { t } = useTranslation();
    const { contributorId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [contributor, setContributor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getPendingProducts();
                const allPending = response.products || [];
                const filteredByContributor = contributorId
                    ? allPending.filter(p => p.contributorId === contributorId)
                    : allPending;

                setProducts(filteredByContributor);

                if (filteredByContributor.length > 0 && filteredByContributor[0].contributor) {
                    setContributor(filteredByContributor[0].contributor);
                }
            } catch (err) {
                console.error('Failed to fetch pending products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [contributorId]);

    const handleAction = async (productId, status) => {
        setProcessing(productId);
        try {
            await updateProductStatus(productId, status);
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (err) {
            console.error(`Failed to ${status} product:`, err);
        } finally {
            setProcessing(null);
        }
    };

    const categories = ['ALL', ...new Set(products.map(p => p.category))];
    const filteredProducts = selectedCategory === 'ALL'
        ? products
        : products.filter(p => p.category === selectedCategory);

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(PATHS.OWNER_CONTRIBUTORS)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {t('contributor_approval.title')} {contributor ? `- ${contributor.name}` : ''}
                        </h1>
                        <p className="text-xs text-gray-500">{t('contributor_approval.subtitle')}</p>
                    </div>
                </div>

                {products.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-200'
                                    }`}
                            >
                                {cat === 'ALL' ? t('contributor_approval.all_categories') : cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900">
                        {selectedCategory === 'ALL' ? t('contributor_approval.no_pending') : `${t('contributor_approval.no_pending')} (${selectedCategory})`}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{t('contributor_approval.no_pending_desc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {filteredProducts.map((product) => (
                        <Motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={product.id}
                            className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col border-b-2 hover:border-indigo-500"
                        >
                            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                                        <Package className="w-10 h-10" />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    <span className="px-2 py-0.5 bg-white/95 backdrop-blur-md rounded-lg text-[9px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm border border-indigo-50">
                                        {product.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 flex-1 flex flex-col justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{product.name}</h3>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-gray-400 font-medium">{t('contributor_approval.stock')}: {product.stock}</span>
                                        <span className="text-indigo-600 font-black">Rp {product.price.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => handleAction(product.id, 'REJECTED')}
                                        disabled={processing === product.id}
                                        className="flex-1 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50 text-[10px] uppercase tracking-wider"
                                        title={t('contributor_approval.reject')}
                                    >
                                        {t('contributor_approval.reject')}
                                    </button>
                                    <button
                                        onClick={() => handleAction(product.id, 'APPROVED')}
                                        disabled={processing === product.id}
                                        className="flex-[2] py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 text-[10px] uppercase tracking-wider"
                                        title={t('contributor_approval.approve')}
                                    >
                                        {t('contributor_approval.approve')}
                                    </button>
                                </div>
                            </div>
                        </Motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OwnerContributorProducts;
