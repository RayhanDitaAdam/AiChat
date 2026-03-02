import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Printer, Save, MapPin, Globe, ShieldCheck, Bot, ExternalLink, Info } from 'lucide-react';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ProgressBar from '../components/ProgressBar.jsx';
import { useTranslation } from 'react-i18next';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition, readOnly }) => {
    const markerRef = React.useRef(null);
    const eventHandlers = React.useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    setPosition([lat, lng]);
                }
            },
        }),
        [setPosition],
    );

    useMapEvents({
        click(e) {
            if (!readOnly) {
                setPosition([e.latlng.lat, e.latlng.lng]);
            }
        },
    });

    return position ? (
        <Marker
            draggable={!readOnly}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    ) : null;
};

const ChangeView = ({ center }) => {
    const map = useMapEvents({});
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const Settings = () => {
    const { t, i18n } = useTranslation();
    const { user, setUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [formData, setFormData] = useState({
        currentPassword: '',
        password: '',
        confirmPassword: '',
        printerIp: user?.printerIp || '',
        printerPort: user?.printerPort || 9100,
        language: user?.language || 'id',
        latitude: user?.latitude || -6.200000,
        longitude: user?.longitude || 106.816666,
        receiptWidth: user?.receiptWidth || '58mm',
        allowChatReview: user?.allowChatReview ?? true,
    });

    const [position, setPosition] = useState([
        user?.latitude || -6.200000,
        user?.longitude || 106.816666
    ]);

    const [detecting, setDetecting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const isLocationSet = user?.latitude && user?.longitude;

    useEffect(() => {
        if (!isLocationSet) {
            setIsEditing(true);
        }
    }, [isLocationSet]);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                printerIp: user.printerIp || '',
                printerPort: user.printerPort || 9100,
                language: user.language || 'id',
                latitude: user.latitude || -6.200000,
                longitude: user.longitude || 106.816666,
                receiptWidth: user.receiptWidth || '58mm',
                allowChatReview: user.allowChatReview ?? true,
            }));
            setPosition([
                user.latitude || -6.200000,
                user.longitude || 106.816666
            ]);
        }
    }, [user]);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            latitude: position[0],
            longitude: position[1]
        }));
    }, [position]);

    const handleDetectLocation = () => {
        setDetecting(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = [pos.coords.latitude, pos.coords.longitude];
                    setPosition(newPos);
                    setDetecting(false);
                    showToast(t('app_settings.messages.location_detected'), 'success');
                },
                (err) => {
                    console.error(err);
                    showToast(t('app_settings.messages.location_failed'), 'error');
                    setDetecting(false);
                },
                { timeout: 10000, maximumAge: 0 }
            );
        } else {
            showToast('Geolocation is not supported by your browser.', 'error');
            setDetecting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'printerPort' ? parseInt(value) || '' : value
        }));

        if (name === 'language') {
            i18n.changeLanguage(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', content: t('app_settings.messages.passwords_mismatch') });
            setLoading(false);
            return;
        }

        const submitData = { ...formData };
        delete submitData.confirmPassword;
        if (!submitData.password) {
            delete submitData.password;
            delete submitData.currentPassword;
        }

        try {
            const response = await api.patch('/auth/profile', submitData);
            if (response.data.status === 'success') {
                setMessage({ type: 'success', content: t('app_settings.messages.update_success') });
                setUser(response.data.user);
                setFormData(prev => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }));
            }
        } catch (error) {
            setMessage({
                type: 'error',
                content: error.response?.data?.message || t('app_settings.messages.update_failed')
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full p-4">
            <div className="max-w-7xl mx-auto py-4 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">{t('app_settings.title')}</h1>
                    <p className="text-slate-500 font-medium">{t('app_settings.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* App Preferences */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{t('app_settings.app_prefs')}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">{t('app_settings.language')}</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="id">Indonesia (ID)</option>
                                        <option value="en">English (EN)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Settings */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800">{t('app_settings.home_location')}</h2>
                            </div>

                            <div className="flex items-center gap-2">
                                {isLocationSet && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`px-6 py-3 rounded-2xl font-semibold text-xs uppercase tracking-widest transition-all ${isEditing
                                            ? 'bg-slate-100 text-slate-600'
                                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                            }`}
                                    >
                                        {isEditing ? t('app_settings.cancel_edit') : t('app_settings.edit_location')}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleDetectLocation}
                                    disabled={detecting || (!isEditing && isLocationSet)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-xs uppercase tracking-widest transition-all ${isLocationSet
                                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                        : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200'
                                        } ${(!isEditing && isLocationSet) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {detecting ? (
                                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                    ) : (
                                        <MapPin className="w-4 h-4" />
                                    )}
                                    {detecting ? t('app_settings.detecting') : (isLocationSet ? t('app_settings.reset_gps') : t('app_settings.detect_gps'))}
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 mb-6 font-medium">{t('app_settings.home_location_desc')}</p>

                        <div className="h-[400px] w-full rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner relative z-0">
                            <MapContainer
                                center={position}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker position={position} setPosition={setPosition} readOnly={!isEditing} />
                                <ChangeView center={position} />
                            </MapContainer>
                        </div>
                    </div>

                    {/* Printer Settings */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                <Printer className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{t('app_settings.printer_config')}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">{t('app_settings.printer_ip')}</label>
                                <input
                                    type="text"
                                    name="printerIp"
                                    value={formData.printerIp}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 font-bold"
                                    placeholder="192.168.1.100"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">{t('app_settings.printer_port')}</label>
                                <input
                                    type="number"
                                    name="printerPort"
                                    value={formData.printerPort}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 font-bold"
                                    placeholder="9100"
                                />
                            </div>
                        </div>

                        {/* Receipt Width Setting - Visible if POS is allowed */}
                        {((user?.role === 'OWNER') ||
                            (user?.role === 'STAFF' && (
                                (user?.disabledMenus?.includes('__OVERRIDE__') && !user.disabledMenus.includes('pos')) ||
                                (!user?.disabledMenus?.includes('__OVERRIDE__') && !user.disabledMenus.includes('pos') && user?.staffRole?.permissions?.pos)
                            ))
                        ) && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold text-slate-700">Thermal Receipt Size</label>
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded-full uppercase font-bold tracking-widest">POS Authorized</span>
                                        </div>
                                        <div className="flex gap-4">
                                            {['38mm', '58mm'].map(size => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, receiptWidth: size }))}
                                                    className={`flex-1 py-4 px-6 rounded-2xl border-2 font-bold text-sm transition-all text-center ${formData.receiptWidth === size
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                                                        : 'border-slate-50 text-slate-400 hover:border-slate-100'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium italic">Adjust the layout based on your physical thermal printer width.</p>
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Change Password Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{t('app_settings.account_security')}</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">{t('app_settings.current_password')}</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 font-bold"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">{t('app_settings.new_password')}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 font-bold"
                                        placeholder="Min. 8 characters"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">{t('app_settings.confirm_password')}</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 font-bold"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Chat Privacy Notice */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">AI Chat Privacy</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">How your chat data is handled</p>
                            </div>
                        </div>
                        <div className="bg-violet-50/60 border border-violet-100 rounded-2xl p-5 space-y-4">
                            <div className="flex gap-3">
                                <Info className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                    Conversations with the AI assistant may be reviewed by our team to improve AI quality and safety. If this is enabled, avoid entering sensitive personal information you wouldn't want reviewed.
                                </p>
                            </div>

                            <div className="flex items-center justify-between py-2 border-y border-violet-100/50 my-2">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Improve AI with my chats</p>
                                    <p className="text-xs text-slate-500 font-medium">Allow human review of saved conversations</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, allowChatReview: !prev.allowChatReview }))}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 ${formData.allowChatReview !== false ? 'bg-violet-600' : 'bg-slate-200'
                                        }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.allowChatReview !== false ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="border-t border-violet-100 pt-4 space-y-2">
                                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">How it works</p>
                                <ul className="space-y-2">
                                    {[
                                        'Chats are stored temporarily to provide context to the AI',
                                        'Saved conversations may be reviewed to improve response quality',
                                        'No personal data is shared with third parties',
                                        'You can clear your chat history anytime from the chat page',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-500 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {message.content && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                            {message.content}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'w-full md:w-64' : ''}`}
                        >
                            {loading ? (
                                <div className="w-full">
                                    <ProgressBar targetWidth="100%" />
                                </div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{t('app_settings.save_settings')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default Settings;
