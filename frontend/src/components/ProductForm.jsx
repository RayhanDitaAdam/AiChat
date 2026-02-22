import React, { useState } from 'react';
import { XCircle, Image as ImageIcon, FileUp, Tag, BadgeCheck, Info, Package, ArrowRight } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ProductForm = ({ isOpen, onClose, onSave, editingProduct, businessCategory }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: editingProduct?.name || '',
        price: editingProduct?.price?.toString() || '',
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
    const [imagePreview, setImagePreview] = useState(editingProduct?.image ? (editingProduct.image.startsWith('http') ? editingProduct.image : `http://localhost:4000${editingProduct.image}`) : null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl relative border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight leading-none">
                                        {editingProduct
                                            ? t(businessCategory === 'HOTEL' ? 'products.form.hotel_update_title' : 'products.form.update_title')
                                            : t(businessCategory === 'HOTEL' ? 'products.form.hotel_create_title' : 'products.form.create_title')}
                                    </h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                                        {editingProduct
                                            ? `${t(businessCategory === 'HOTEL' ? 'products.form.hotel_id_label' : 'products.form.id_label')}: ` + editingProduct.id.slice(0, 8)
                                            : t(businessCategory === 'HOTEL' ? 'products.form.hotel_new_registry' : 'products.form.new_registry')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} id="product-registry-form" className="flex-1 overflow-y-auto custom-scrollbar p-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                                {/* Left Column: Media & Specs */}
                                <div className="lg:col-span-5 space-y-10">
                                    {/* Media Section */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ImageIcon className="w-4 h-4 text-indigo-600" />
                                            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">{t(businessCategory === 'HOTEL' ? 'products.form.hotel_media' : 'products.form.media')}</h3>
                                        </div>

                                        <div className="relative group aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-100/50 transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer shadow-inner">
                                            {imagePreview || formData.imageUrl ? (
                                                <>
                                                    <img
                                                        src={imagePreview || formData.imageUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <FileUp className="w-8 h-8 text-white" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-8">
                                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                        <ImageIcon className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{t(businessCategory === 'HOTEL' ? 'products.form.hotel_upload_image' : 'products.form.upload_image')}</p>
                                                </div>
                                            )}
                                            <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Tag className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                </div>
                                                <input
                                                    value={formData.imageUrl}
                                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 text-sm"
                                                    placeholder={t('products.form.image_url_placeholder')}
                                                />
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-2 opacity-60">
                                                {t(businessCategory === 'HOTEL' ? 'products.form.hotel_image_url_desc' : 'products.form.image_url_desc')}
                                            </p>
                                        </div>
                                    </section>

                                    {/* Quick Specs */}
                                    <section className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.halal ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                                                    <BadgeCheck className="w-6 h-6" />
                                                </div>
                                                <label htmlFor="halal" className="text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer">
                                                    {t('products.form.halal_cert')}
                                                </label>
                                            </div>
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    id="halal"
                                                    checked={formData.halal}
                                                    onChange={e => setFormData({ ...formData, halal: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: Identity & Logistics */}
                                <div className="lg:col-span-7 space-y-10">
                                    {/* Identity Section */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="w-4 h-4 text-indigo-600" />
                                            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">{t(businessCategory === 'HOTEL' ? 'products.form.hotel_basic_info' : 'products.form.basic_info')}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[10px] font-semibold text-slate-400 ml-1 uppercase">{t(businessCategory === 'HOTEL' ? 'products.form.hotel_name' : 'products.form.name')}</label>
                                                <input
                                                    required
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-[#fcfcfc] border border-slate-200 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-sm"
                                                    placeholder={t(businessCategory === 'HOTEL' ? 'products.form.hotel_name_placeholder' : 'products.form.name_placeholder')}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-semibold text-slate-400 ml-1 uppercase">{t(businessCategory === 'HOTEL' ? 'products.form.hotel_category' : 'products.form.category')}</label>
                                                <input
                                                    required
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full bg-[#fcfcfc] border border-slate-200 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-sm"
                                                    placeholder={t(businessCategory === 'HOTEL' ? 'products.form.hotel_category_placeholder' : 'products.form.category_placeholder')}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-semibold text-slate-400 ml-1 uppercase">{t(businessCategory === 'HOTEL' ? 'products.form.hotel_price' : 'products.form.price')}</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                        <span className="text-slate-400 font-bold text-sm">Rp</span>
                                                    </div>
                                                    <input
                                                        required
                                                        type="number"
                                                        value={formData.price}
                                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                        className="w-full bg-[#fcfcfc] border border-slate-200 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[10px] font-semibold text-slate-400 ml-1 uppercase">{t(businessCategory === 'HOTEL' ? 'products.form.hotel_description' : 'products.form.description')}</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    rows="3"
                                                    className="w-full bg-[#fcfcfc] border border-slate-200 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-sm resize-none"
                                                    placeholder={t(businessCategory === 'HOTEL' ? 'products.form.hotel_description_placeholder' : 'products.form.description_placeholder')}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Logistics & Stock */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Package className="w-4 h-4 text-indigo-600" />
                                            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                                                {businessCategory === 'HOTEL' ? t('products.form.logistics_hotel') : t('products.form.logistics_stock')}
                                            </h3>
                                        </div>


                                        <div className="grid grid-cols-3 gap-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-semibold text-slate-400 ml-1 uppercase">
                                                    {businessCategory === 'HOTEL' ? t('products.form.availability') : t('products.form.stock')}
                                                </label>
                                                <input
                                                    required
                                                    type="number"
                                                    value={formData.stock}
                                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                                    className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-sm text-center"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-semibold text-slate-400 ml-1 uppercase">
                                                    {businessCategory === 'HOTEL' ? t('products.form.bed_type') : t('products.form.aisle')}
                                                </label>
                                                <input
                                                    required
                                                    value={formData.aisle}
                                                    onChange={e => setFormData({ ...formData, aisle: e.target.value })}
                                                    className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-sm text-center"
                                                    placeholder={businessCategory === 'HOTEL' ? "King, Twin, etc." : "A1, B2, etc."}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-semibold text-slate-400 ml-1 uppercase">
                                                    {businessCategory === 'HOTEL' ? t('products.form.room_number') : t('products.form.rak')}
                                                </label>
                                                <input
                                                    required
                                                    value={formData.rak}
                                                    onChange={e => setFormData({ ...formData, rak: e.target.value })}
                                                    className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-sm text-center"
                                                    placeholder={businessCategory === 'HOTEL' ? "101, 202, etc." : "Shelf 1, etc."}
                                                />
                                            </div>

                                            {businessCategory !== 'HOTEL' && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-semibold text-slate-400 ml-1 uppercase">{t('products.form.expiry_date')}</label>
                                                    <input
                                                        type="date"
                                                        value={formData.expiryDate}
                                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                                        className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-sm text-center"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </form>

                        {/* Footer Actions */}
                        <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-4 rounded-2xl text-sm font-semibold text-slate-400 hover:text-slate-900 hover:bg-white transition-all uppercase tracking-widest"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                form="product-registry-form"
                                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-semibold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3 group"
                            >
                                <span>{editingProduct
                                    ? t(businessCategory === 'HOTEL' ? 'products.form.hotel_save_changes' : 'products.form.save_changes')
                                    : t(businessCategory === 'HOTEL' ? 'products.form.hotel_publish' : 'products.form.publish')}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductForm;
