import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { X, Image as ImageIcon, FileUp, Tag, BadgeCheck, Info, Package, ArrowRight, DollarSign, MapPin, Hash, LayoutGrid, Calendar, Loader2 } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getBaseURL } from '../services/api.js';

const ProductForm = ({ isOpen, onClose, onSave, editingProduct, businessCategory, ownerBrand = 'Inventory', currency = 'Rp' }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: editingProduct?.name || '',
        price: editingProduct?.price?.toString() || '',
        purchasePrice: editingProduct?.purchasePrice?.toString() || '',
        stock: editingProduct?.stock?.toString() || '',
        aisle: editingProduct?.aisle || '',
        rak: editingProduct?.rak || '',
        category: editingProduct?.category || '',
        halal: editingProduct?.halal ?? true,
        description: editingProduct?.description || '',
        imageUrl: editingProduct?.imageUrl || (editingProduct?.image?.startsWith('http') ? editingProduct.image : ''),
        expiryDate: editingProduct?.expiryDate ? editingProduct.expiryDate.split('T')[0] : ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(editingProduct?.image ? (editingProduct.image.startsWith('http') ? editingProduct.image : `${getBaseURL()}${editingProduct.image}`) : null);
    const [isCompressing, setIsCompressing] = useState(false);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsCompressing(true);
            try {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                };

                const compressedFile = await imageCompression(file, options);
                setImageFile(compressedFile);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error('Compression error:', error);
                // Fallback to original file if compression fails
                setImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        if (imageFile) {
            data.append('image', imageFile);
        }
        onSave(data);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100/50">
                                    <Package size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {editingProduct
                                            ? t(businessCategory === 'HOTEL' ? 'products.form.hotel_update_title' : 'products.form.update_title')
                                            : t(businessCategory === 'HOTEL' ? 'products.form.hotel_create_title' : 'products.form.create_title')}
                                    </h3>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {t('products.form.strategic_management') || 'Management'} — {ownerBrand}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} id="product-registry-form" className="flex-1 overflow-y-auto p-6 custom-scrollbar text-left">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Section: Visuals & Core Specs */}
                                <div className="space-y-6">
                                    {/* Image Upload Area */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Product Visualization</label>
                                        <div className="relative group aspect-video bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer">
                                            {imagePreview || formData.imageUrl ? (
                                                <>
                                                    <img
                                                        src={imagePreview || formData.imageUrl}
                                                        alt="Preview"
                                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isCompressing ? 'opacity-50' : ''}`}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <FileUp size={32} className="text-white" />
                                                    </div>
                                                    {isCompressing && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                                                            <Loader2 size={32} className="text-white animate-spin mb-2" />
                                                            <span className="text-white text-[10px] font-bold uppercase tracking-wider">Optimizing...</span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-center p-6">
                                                    {isCompressing ? (
                                                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-2" />
                                                    ) : (
                                                        <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-500 mx-auto mb-2" />
                                                    )}
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                                        {isCompressing ? 'Optimizing Media...' : t(businessCategory === 'HOTEL' ? 'products.form.hotel_upload_image' : 'products.form.upload_image')}
                                                    </p>
                                                </div>
                                            )}
                                            <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                        </div>
                                    </div>

                                    {/* URL Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('products.form.image_url')}</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <input
                                                value={formData.imageUrl}
                                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                                placeholder={t('products.form.image_url_placeholder')}
                                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Halal Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${formData.halal ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-gray-100 text-gray-400 dark:bg-gray-600'}`}>
                                                <BadgeCheck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{t('products.form.halal_cert')}</p>
                                                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{t('products.form.compliance_verification') || 'Compliance Verification'}</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                id="halal"
                                                checked={formData.halal}
                                                onChange={e => setFormData({ ...formData, halal: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Right Section: Identification & Logistics */}
                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t(businessCategory === 'HOTEL' ? 'products.form.hotel_name' : 'products.form.name')}</label>
                                            <input
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder={t(businessCategory === 'HOTEL' ? 'products.form.hotel_name_placeholder' : 'products.form.name_placeholder')}
                                                className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t(businessCategory === 'HOTEL' ? 'products.form.hotel_category' : 'products.form.category')}</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <LayoutGrid className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <input
                                                        required
                                                        value={formData.category}
                                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                        placeholder={t(businessCategory === 'HOTEL' ? 'products.form.hotel_category_placeholder' : 'products.form.category_placeholder')}
                                                        className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('products.form.purchase_price')} ({currency})</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none font-bold text-xs text-slate-500 mt-0.5">
                                                        {currency}
                                                    </div>
                                                    <input
                                                        required
                                                        type="number"
                                                        value={formData.purchasePrice}
                                                        onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                                                        placeholder={t('products.form.purchase_price_placeholder') || 'Cost'}
                                                        className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t(businessCategory === 'HOTEL' ? 'products.form.hotel_price' : 'products.form.price')} ({currency})</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none font-bold text-xs text-slate-500 mt-0.5">
                                                        {currency}
                                                    </div>
                                                    <input
                                                        required
                                                        type="number"
                                                        value={formData.price}
                                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                        className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('products.form.logistics_stock')}</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <input
                                                        required
                                                        type="number"
                                                        value={formData.stock}
                                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                                        placeholder="Stock"
                                                        className="block w-full p-3 pl-9 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <input
                                                        required
                                                        value={formData.aisle}
                                                        onChange={e => setFormData({ ...formData, aisle: e.target.value })}
                                                        placeholder={t('products.form.aisle') || 'Aisle'}
                                                        className="block w-full p-3 pl-9 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <input
                                                        required
                                                        value={formData.rak}
                                                        onChange={e => setFormData({ ...formData, rak: e.target.value })}
                                                        placeholder={t('products.form.rak') || 'Rak'}
                                                        className="block w-full p-3 pl-9 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {businessCategory !== 'HOTEL' && (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('products.form.expiry_date')}</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="date"
                                                        value={formData.expiryDate}
                                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                                        className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t(businessCategory === 'HOTEL' ? 'products.form.hotel_description' : 'products.form.description')}</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                rows="4"
                                                placeholder={t(businessCategory === 'HOTEL' ? 'products.form.hotel_description_placeholder' : 'products.form.description_placeholder')}
                                                className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all resize-none shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="flex items-center space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <button
                                type="submit"
                                form="product-registry-form"
                                className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-bold rounded-xl text-sm px-6 py-3 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 disabled:opacity-50 inline-flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
                            >
                                <span>{editingProduct
                                    ? t(businessCategory === 'HOTEL' ? 'products.form.hotel_save_changes' : 'products.form.save_changes')
                                    : t(businessCategory === 'HOTEL' ? 'products.form.hotel_publish' : 'products.form.publish')}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-xl border border-gray-200 text-sm font-bold px-6 py-3 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 transition-all active:scale-95"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductForm;
