import React, { useState, useEffect, useCallback } from 'react';
import { getPOSSettings, updatePOSSettings } from '../../../services/api.js';
import { Save, RefreshCw, Zap, ShieldCheck, Gift } from 'lucide-react';
import { useToast } from '../../../context/ToastContext.js';
import { motion as Motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const POSSettings = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        storeName: '',
        address: '',
        phone: '',
        pointMinSpend: 50000,
        pointRatio: 10000,
        pointRedeemVal: 1000,
        pointExpiryDays: 365,
        pointMaxUsagePercent: 50,
        pointMinRedeem: 10,
        pointBonusRegistration: 10,
        pointBonusBirthday: 50,
        pointFridayMultiplier: 2
    });

    const fetchSettings = useCallback(async () => {
        try {
            const res = await getPOSSettings();
            if (res.status === 'success' && res.data) {
                setSettings(res.data);
            }
        } catch (err) {
            console.error(err);
            showToast(t('pos_settings.fetch_error') || 'Failed to fetch settings', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, t]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await updatePOSSettings(settings);
            if (res.status === 'success') {
                showToast(t('pos_settings.save_success'), 'success');
            }
        } catch (err) {
            showToast(err.message || t('pos_settings.save_error'), 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-full p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('pos_settings.title')}</h1>
                <p className="text-slate-500 font-medium">{t('pos_settings.subtitle')}</p>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earning Rules */}
                <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">{t('pos_settings.earning_rules')}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('pos_settings.min_spend')} (Rp)</label>
                            <input
                                type="number"
                                value={settings.pointMinSpend}
                                onChange={(e) => setSettings({ ...settings, pointMinSpend: Number(e.target.value) })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('pos_settings.point_ratio')}</label>
                            <input
                                type="number"
                                value={settings.pointRatio}
                                onChange={(e) => setSettings({ ...settings, pointRatio: Number(e.target.value) })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('pos_settings.friday_multiplier')}</label>
                            <input
                                type="number"
                                value={settings.pointFridayMultiplier}
                                onChange={(e) => setSettings({ ...settings, pointFridayMultiplier: Number(e.target.value) })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('pos_settings.point_expiry_days')}</label>
                            <input
                                type="number"
                                value={settings.pointExpiryDays}
                                onChange={(e) => setSettings({ ...settings, pointExpiryDays: Number(e.target.value) })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                            />
                        </div>
                    </div>
                </section>

                {/* Redemption Rules */}
                <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">{t('pos_settings.redemption_rules')}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('pos_settings.point_value')} (Rp)</label>
                            <input
                                type="number"
                                value={settings.pointRedeemVal}
                                onChange={(e) => setSettings({ ...settings, pointRedeemVal: Number(e.target.value) })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('pos_settings.min_redemption')}</label>
                            <input
                                type="number"
                                value={settings.pointMinRedeem}
                                onChange={(e) => setSettings({ ...settings, pointMinRedeem: Number(e.target.value) })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('pos_settings.max_usage_percent')}</label>
                            <input
                                type="number"
                                max="100"
                                value={settings.pointMaxUsagePercent}
                                onChange={(e) => setSettings({ ...settings, pointMaxUsagePercent: Number(e.target.value) })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                            />
                        </div>
                    </div>
                </section>

                {/* Bonus Points */}
                <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <Gift className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">{t('pos_settings.bonus_rules')}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('pos_settings.registration_bonus')} (Pts)</label>
                            <input
                                type="number"
                                value={settings.pointBonusRegistration}
                                onChange={(e) => setSettings({ ...settings, pointBonusRegistration: Number(e.target.value) })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('pos_settings.birthday_bonus')} (Pts)</label>
                            <input
                                type="number"
                                value={settings.pointBonusBirthday}
                                onChange={(e) => setSettings({ ...settings, pointBonusBirthday: Number(e.target.value) })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                            />
                        </div>
                    </div>
                </section>

                {/* Action Section */}
                <section className="md:col-span-2 flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-10 py-4 bg-slate-900 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? t('settings.saving') : t('settings.save')}
                    </button>
                </section>
            </form>
        </div>
    );
};

export default POSSettings;
