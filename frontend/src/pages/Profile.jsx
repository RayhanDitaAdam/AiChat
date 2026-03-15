import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { User, Printer, Save, Smartphone, MapPin, Globe, FileText, Edit, ChevronRight, Lock, Settings, ShieldCheck, UserPlus } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import UserAvatar from '../components/UserAvatar.jsx';
import Avatar from 'boring-avatars';
import api, { unlinkWithGoogle } from '../services/api.js';
import MembershipCard from '../components/MembershipCard.jsx';
import { useToast } from '../context/ToastContext.js';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ProgressBar from '../components/ProgressBar.jsx';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { PATHS } from '../routes/paths.js';
import { useTranslation } from 'react-i18next';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition, readOnly }) => {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(
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

const Profile = () => {
    const { t } = useTranslation();
    const { user, setUser, linkWithGoogle } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        printerIp: user?.printerIp || '',
        printerPort: user?.printerPort || 9100,
        language: user?.language || 'id',
        phone: user?.phone || '',
        latitude: user?.latitude || -6.200000,
        longitude: user?.longitude || 106.816666,
        medicalRecord: user?.medicalRecord || '',
        avatarVariant: user?.avatarVariant || 'beam',
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
            setFormData({
                name: user.name || '',
                email: user.email || '',
                printerIp: user.printerIp || '',
                printerPort: user.printerPort || 9100,
                language: user.language || 'id',
                phone: user.phone || '',
                latitude: user.latitude || -6.200000,
                longitude: user.longitude || 106.816666,
                medicalRecord: user.medicalRecord || '',
                avatarVariant: user.avatarVariant || 'beam',
                receiptWidth: user.receiptWidth || '58mm',
                allowChatReview: user.allowChatReview ?? true,
            });
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
                    showToast('Location detected!', 'success');
                },
                (err) => {
                    console.error(err);
                    let errMsg = 'Failed to detect location.';
                    if (err.code === 1) errMsg = 'Location access denied. Please allow location permissions in your browser.';
                    else if (err.code === 2) errMsg = 'Location unavailable. This might be a temporary issue with your browser or device.';
                    else if (err.code === 3) errMsg = 'Geolocation timeout. Try again.';

                    showToast(errMsg, 'error');
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        // Prepare data
        const submitData = { ...formData };

        try {
            const response = await api.patch('/auth/profile', submitData);
            if (response.data.status === 'success') {
                setMessage({ type: 'success', content: 'Profile updated successfully!' });
                setUser(response.data.user);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                content: error.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLinkSuccess = async (credentialResponse) => {
        setLoading(true);
        setMessage({ type: '', content: '' });
        try {
            const data = await linkWithGoogle(credentialResponse.credential);
            if (data.status === 'success') {
                showToast(data.message || 'Akun Google berhasil ditautkan!', 'success');
                if (data.user) setUser(data.user);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Gagal menautkan akun Google';
            showToast(errorMsg, 'error');
            setMessage({ type: 'error', content: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleUnlink = async () => {
        if (!window.confirm('Apakah Anda yakin ingin melepas tautan akun Google?')) return;

        setLoading(true);
        setMessage({ type: '', content: '' });
        try {
            const data = await unlinkWithGoogle();
            if (data.status === 'success') {
                showToast(data.message || 'Tautan akun Google berhasil dilepas!', 'success');
                if (data.user) setUser(data.user);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Gagal melepas tautan akun Google';
            showToast(errorMsg, 'error');
            setMessage({ type: 'error', content: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl p-4 md:p-6 2xl:p-10 bg-[#f9f9f9] min-h-screen">
            {/* Breadcrumb Start */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
                    Profile
                </h2>

                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <span className="font-medium text-slate-500">Dashboard /</span>
                        </li>
                        <li className="font-medium text-indigo-600">Profile</li>
                    </ol>
                </nav>
            </div>
            {/* Breadcrumb End */}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Overview Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-slate-200 dark:border-slate-800">
                                <Avatar
                                    size="100%"
                                    name={formData.name || 'User'}
                                    variant={formData.avatarVariant}
                                    colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                                />
                            </div>
                            <div className="flex-1 text-center xl:text-left">
                                <h4 className="mb-1 text-xl font-bold text-slate-800 dark:text-white/90">
                                    {user?.name || 'Guest User'}
                                </h4>
                                <div className="flex flex-col items-center gap-2 xl:flex-row xl:gap-4">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                        {user?.role || 'Guest'}
                                    </p>
                                    <div className="hidden h-3 w-px bg-slate-300 xl:block dark:bg-slate-700"></div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-20"><ProgressBar targetWidth="100%" /></div>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Personal Information Card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                            <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Personal Information
                                </h3>
                                <User className="w-5 h-5 text-slate-400" />
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                                        placeholder="Email Address"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                                            placeholder="Phone Number"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Language</label>
                                        <select
                                            name="language"
                                            value={formData.language}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:text-white cursor-pointer"
                                        >
                                            <option value="id">Indonesia (ID)</option>
                                            <option value="en">English (EN)</option>
                                        </select>
                                    </div>
                                </div>

                                {user?.role === 'USER' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Medical Record</label>
                                        <textarea
                                            name="medicalRecord"
                                            value={formData.medicalRecord}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:text-white resize-none"
                                            placeholder="Allergies, chronic conditions..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Avatar Customization Card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                            <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Avatar Style
                                </h3>
                                <Settings className="w-5 h-5 text-slate-400" />
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {["beam", "marble", "pixel", "sunset", "bauhaus", "ring"].map((variant) => (
                                    <button
                                        key={variant}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, avatarVariant: variant }))}
                                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${formData.avatarVariant === variant
                                            ? 'border-indigo-600 ring-4 ring-indigo-600/5 scale-105 z-10'
                                            : 'border-slate-100 hover:border-slate-300 dark:border-slate-700'
                                            }`}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                                            <Avatar
                                                size="100%"
                                                name={formData.name || 'User'}
                                                variant={variant}
                                                colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                                            />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur-sm p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-white font-bold capitalize">{variant}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                            <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Security
                                </h3>
                                <Lock className="w-5 h-5 text-slate-400" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{t('profile.account_security') || 'Account Security'}</p>
                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{t('profile.last_updated') || 'Last updated'} 2 days ago</p>
                                        </div>
                                    </div>
                                    <Link
                                        to={user?.role === 'ADMIN' ? '#' : (user?.role === 'OWNER' ? PATHS.OWNER_CHANGE_PASSWORD : (user?.role === 'CONTRIBUTOR' ? PATHS.CONTRIBUTOR_CHANGE_PASSWORD : PATHS.USER_CHANGE_PASSWORD))}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-white text-indigo-600 text-xs font-semibold uppercase tracking-widest rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all text-center shadow-sm"
                                    >
                                        {t('profile.change_password')}
                                    </Link>


                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-violet-50/50 rounded-2xl border border-violet-100 mt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-violet-600 shadow-sm">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{t('profile.ai_chat_privacy') || 'AI Chat Privacy'}</p>
                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-snug">{t('profile.ai_chat_desc') || 'Allow human review of saved chats to improve AI.'}</p>
                                        </div>
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

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm mt-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 shadow-inner group-hover:scale-110 transition-transform">
                                            <svg role="img" viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.09H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.91l3.66-2.8z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.09l3.66 2.84c.86-2.59 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800">Google Account</p>
                                            <p className={`text-[11px] font-medium uppercase tracking-wider ${user?.googleId ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {user?.googleId ? (
                                                    <span className="flex items-center gap-1">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Connected
                                                    </span>
                                                ) : 'Not Linked'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative w-full sm:w-auto">
                                        {user?.googleId ? (
                                            <div className="flex items-center gap-2">
                                                <span className="hidden sm:inline-block px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">
                                                    Linked Successfully
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleGoogleUnlink}
                                                    disabled={loading}
                                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    {loading ? '...' : 'Disconnect'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="group/btn relative overflow-hidden rounded-xl border border-slate-200">
                                                <button
                                                    type="button"
                                                    disabled={loading}
                                                    className="w-full sm:w-48 px-6 py-3 bg-white text-slate-700 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {loading ? (
                                                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <UserPlus className="w-4 h-4 text-indigo-600" />
                                                            <span>Connect Google</span>
                                                        </>
                                                    )}
                                                </button>
                                                {!loading && (
                                                    <div className="absolute inset-0 opacity-0 z-10 cursor-pointer scale-150">
                                                        <GoogleLogin
                                                            onSuccess={handleGoogleLinkSuccess}
                                                            onError={() => showToast('Google Link failed.', 'error')}
                                                            theme="outline"
                                                            size="large"
                                                            shape="rect"
                                                            width="100%"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {message.type === 'error' && message.content.includes('Google') && (
                                    <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 animate-shake">
                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-rose-600 shrink-0 shadow-sm font-bold text-xs !important">!</div>
                                        <p className="text-[11px] font-bold text-rose-700 leading-tight">
                                            {message.content}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                            /* Printer Settings Card */
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                                <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                        Printer Configuration
                                    </h3>
                                    <Printer className="w-5 h-5 text-slate-400" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Printer IP</label>
                                        <input
                                            type="text"
                                            name="printerIp"
                                            value={formData.printerIp}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-indigo-500 outline-none dark:border-slate-700 dark:bg-slate-800/50"
                                            placeholder="192.168.1.100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Port</label>
                                        <input
                                            type="number"
                                            name="printerPort"
                                            value={formData.printerPort}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-indigo-500 outline-none dark:border-slate-700 dark:bg-slate-800/50"
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
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <span>Thermal Receipt Size</span>
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded-full uppercase">POS Authorized</span>
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {['38mm', '58mm'].map(size => (
                                                        <button
                                                            key={size}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, receiptWidth: size }))}
                                                            className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${formData.receiptWidth === size
                                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                                : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                                                                }`}
                                                        >
                                                            {size}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium">Configure this based on your physical thermal printer width.</p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {user?.role === 'USER' && (
                            <>
                                {/* Membership & Points Card */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                                    <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Benefits & Status
                                        </h3>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                                            Active Member
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <MembershipCard user={{ ...user, avatarVariant: formData.avatarVariant }} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-indigo-600 rounded-3xl p-6 text-white text-center shadow-lg shadow-indigo-100 dark:shadow-none">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">My Points</p>
                                            <p className="text-4xl font-bold tracking-tighter">{user?.points || 0}</p>
                                        </div>
                                        <div className="bg-white rounded-3xl p-6 text-slate-900 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Member ID</p>
                                            <p className="text-lg font-bold tracking-tight">{user?.customerId || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Join Contributor Card */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                                    <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            {t('profile.contributor_program') || 'Contributor Program'}
                                        </h3>
                                        <UserPlus className="w-5 h-5 text-indigo-600" />
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {t('profile.contributor_desc') || 'Help stores manage their products and grow together. Join our contributor community today!'}
                                        </p>
                                        <Link
                                            to={PATHS.BECOME_CONTRIBUTOR}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-100 transition-all"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>{t('profile.join_contributor') || 'Join as Contributor'}</span>
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Location Card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                            <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Location Settings
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleDetectLocation}
                                    disabled={detecting}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-slate-800"
                                    title="Auto-detect location"
                                >
                                    <MapPin className={`w-5 h-5 ${detecting ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latitude</span>
                                        <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold dark:bg-slate-800/50 dark:border-slate-700 dark:text-white">
                                            {position[0].toFixed(6)}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Longitude</span>
                                        <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold dark:bg-slate-800/50 dark:border-slate-700 dark:text-white">
                                            {position[1].toFixed(6)}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[300px] w-full rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner relative z-0 dark:border-slate-800">
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

                                <button
                                    type="button"
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isEditing
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                >
                                    {isEditing ? '✓ Editing Enabled (Click map to pick)' : 'Enable Marker Placement'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Status Message */}
            <AnimatePresence>
                {message.content && (
                    <Motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-800'
                            }`}
                    >
                        {message.content}
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
