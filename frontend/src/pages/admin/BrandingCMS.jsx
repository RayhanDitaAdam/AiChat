import React, { useState, useEffect } from 'react';
import { Palette, Save, RefreshCw, Upload, Building2, Eye, Loader2, ImageOff } from 'lucide-react';
import { getSystemConfig, updateSystemConfig } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';

const BrandingCMS = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [config, setConfig] = useState({ companyName: 'HeartAI', companyLogo: '' });
    const [preview, setPreview] = useState({ name: 'HeartAI', logo: '' });

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer?.files?.[0];
        handleFileUpload(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        handleFileUpload(file);
    };

    const handleFileUpload = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Please upload a valid image file', 'error');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast('Image size should be less than 2MB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setConfig(p => ({ ...p, companyLogo: base64 }));
            setPreview(p => ({ ...p, logo: base64 }));
            showToast('Logo ready to save', 'success');
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getSystemConfig();
                if (res.status === 'success') {
                    const { companyName = 'HeartAI', companyLogo = '' } = res.data;
                    setConfig({ companyName, companyLogo });
                    setPreview({ name: companyName, logo: companyLogo });
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!config.companyName.trim()) { showToast('Company name is required', 'error'); return; }
        setSaving(true);
        try {
            await updateSystemConfig(config);
            setPreview({ name: config.companyName, logo: config.companyLogo });
            showToast('Branding updated! ✨ AI responses will now use the new name.', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save branding', 'error');
        } finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
    );

    return (
        <div className="max-w-5xl space-y-10">
            <header className="space-y-1">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                    Branding <span className="text-sky-500">CMS</span>
                </h1>
                <p className="text-slate-500 font-medium">
                    Customize your company name and logo. Changes apply to AI responses, emails, and the platform UI.
                </p>
            </header>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left — Editor */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Company Name */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Company Identity</h2>
                                <p className="text-xs text-slate-400 font-medium">Used in AI persona, emails, and UI labels</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Company / Brand Name *</label>
                            <input
                                type="text"
                                value={config.companyName}
                                onChange={e => setConfig(p => ({ ...p, companyName: e.target.value }))}
                                onBlur={() => setPreview(p => ({ ...p, name: config.companyName || 'HeartAI' }))}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900 font-bold text-lg transition-all"
                                placeholder="e.g. MyBrand"
                                required
                            />
                            <p className="text-xs text-slate-400 ml-1 italic">
                                AI will introduce itself as <strong>"{config.companyName || 'HeartAI'} v.1"</strong> to customers.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Company Logo</label>

                            {/* Drag and Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`w-full relative overflow-hidden rounded-[1.25rem] border-2 transition-all duration-300 ${isDragging ? 'border-sky-500 bg-sky-50' : 'border-dashed border-slate-300 hover:border-sky-400 bg-slate-50'}`}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 pointer-events-none">
                                    <div className={`p-3 rounded-full ${isDragging ? 'bg-sky-100 text-sky-600' : 'bg-white shadow-sm text-slate-400'}`}>
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">
                                            {isDragging ? 'Drop logo here...' : 'Click or Drag & Drop to upload logo'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, SVG up to 2MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 py-2">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR PASTE URL</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            <input
                                type="url"
                                value={config.companyLogo}
                                onChange={e => setConfig(p => ({ ...p, companyLogo: e.target.value }))}
                                onBlur={() => setPreview(p => ({ ...p, logo: config.companyLogo }))}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-700 font-medium transition-all"
                                placeholder="https://example.com/logo.png"
                            />
                        </div>
                    </div>

                    {/* Impact Summary */}
                    <div className="bg-sky-50 border border-sky-100 rounded-[2rem] p-6">
                        <h3 className="font-bold text-sky-900 mb-3 text-sm flex items-center gap-2">
                            <Palette className="w-4 h-4" /> Where this name is used
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                'AI chat greeting ("Hi, I\'m [Name]")',
                                'Management AI persona ("[Name]-MGMT")',
                                'Email sender name ("[Name] Support")',
                                'Email footers & copyright text',
                                'Admin panel label reference',
                                'Guest AI responses',
                            ].map(item => (
                                <div key={item} className="flex items-start gap-2 text-sm text-sky-800">
                                    <span className="text-sky-400 mt-0.5">✓</span> {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                        >
                            {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Branding</>}
                        </button>
                    </div>
                </div>

                {/* Right — Preview */}
                <div className="space-y-4">
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Preview</h3>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Logo preview */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-center min-h-[100px]">
                                {preview.logo ? (
                                    <img src={preview.logo} alt="Logo preview" className="max-h-16 object-contain" onError={e => { e.target.style.display = 'none'; }} />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-300">
                                        <ImageOff className="w-8 h-8" />
                                        <span className="text-xs font-medium">No logo set</span>
                                    </div>
                                )}
                            </div>

                            {/* Email preview */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                                <div className="bg-slate-800 text-white px-4 py-3 flex items-center gap-2">
                                    {preview.logo && <img src={preview.logo} alt="logo" className="h-5 object-contain" />}
                                    <span className="font-bold">{preview.name}</span>
                                </div>
                                <div className="bg-white p-4 space-y-1.5">
                                    <p className="font-bold text-slate-900">Verify Your Email</p>
                                    <p className="text-slate-500">Your verification code is: <strong>123456</strong></p>
                                    <p className="text-slate-400 text-[11px] pt-2 border-t border-slate-100 mt-2">
                                        © {new Date().getFullYear()} {preview.name}. All Rights Reserved.
                                    </p>
                                </div>
                            </div>

                            {/* Chat AI preview */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 text-slate-400 font-medium">AI Chat Preview</div>
                                <div className="p-4 space-y-2 bg-white">
                                    <div className="flex gap-2">
                                        <div className="w-6 h-6 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-[10px]">{(preview.name || 'H')[0]}</div>
                                        <div className="bg-sky-50 border border-sky-100 rounded-xl px-3 py-2 text-slate-700 leading-relaxed">
                                            Halo! Saya <strong>{preview.name} v.1</strong>, asisten belanja Anda. Ada yang bisa saya bantu? 😊
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BrandingCMS;
