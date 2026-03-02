import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { MapPin, Save, RefreshCw, AlertCircle, Globe, Navigation, Bot, Sparkles, MessageSquare, Shield } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { updateStoreSettings, fetchMyStoreConfig, updateMyStoreConfig } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
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

const StoreSettings = () => {
    const { t } = useTranslation();
    const { user, setUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const isLocationSet = user?.owner?.latitude && user?.owner?.longitude;

    useEffect(() => {
        if (!isLocationSet) {
            setIsEditing(true);
        }
    }, [isLocationSet]);

    const [formData, setFormData] = useState({
        name: user?.owner?.name || '',
        domain: user?.owner?.domain || '',
        latitude: user?.owner?.latitude || -6.200000,
        longitude: user?.owner?.longitude || 106.816666,
    });

    const [config, setConfig] = useState({
        aiSystemPrompt: '',
        aiGuestSystemPrompt: '',
        aiTemperature: 0.7,
        aiMaxTokens: 500
    });
    const [configLoading, setConfigLoading] = useState(false);

    const defaultGuestPrompt = "You are HEART v.1, a smart and friendly store assistant. Help the guest with product information, including Aisle and Rack locations if available. Use natural and complete sentences in Indonesian. No small talk. No weather info.";
    const defaultRegPrompt = "You are Heart, an AI shopping assistant.";

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetchMyStoreConfig();
                if (res.status === 'success') {
                    setConfig({
                        aiSystemPrompt: res.config.aiSystemPrompt || defaultRegPrompt,
                        aiGuestSystemPrompt: res.config.aiGuestSystemPrompt || defaultGuestPrompt,
                        aiTemperature: res.config.aiTemperature || 0.7,
                        aiMaxTokens: res.config.aiMaxTokens || 500
                    });
                }
            } catch (err) {
                console.error('Failed to fetch config', err);
            }
        };
        fetchConfig();
    }, []);



    const [position, setPosition] = useState([
        user?.owner?.latitude || -6.200000,
        user?.owner?.longitude || 106.816666
    ]);

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
                    showToast(t('settings.messages.location_success'), 'success');
                },
                (err) => {
                    console.error(err);
                    let errMsg = 'Failed to detect location.';
                    if (err.code === 1) errMsg = 'Location access denied. Please allow location permissions.';
                    else if (err.code === 2) errMsg = 'Location unavailable. Please check your browser or device settings.';
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

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        setConfigLoading(true);
        try {
            const res = await updateMyStoreConfig(config);
            if (res.status === 'success') {
                showToast('AI Configuration saved successfully', 'success');
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save AI configuration', 'error');
        } finally {
            setConfigLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await updateStoreSettings({
                name: formData.name,
                domain: formData.domain,
                latitude: position[0],
                longitude: position[1],
            });

            if (result.status === 'success') {
                showToast(t('settings.messages.update_success'), 'success');
                setIsEditing(false);
                // Update local user state to reflect changes
                setUser({
                    ...user,
                    owner: {
                        ...user.owner,
                        name: formData.name,
                        domain: formData.domain,
                        latitude: position[0],
                        longitude: position[1],
                    }
                });
            }
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || 'Failed to update store settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full">
            <div className="space-y-8 p-4 md:p-6">

                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('settings.title')}</h1>
                    <p className="text-slate-500 font-medium">{t('settings.subtitle')}</p>
                </div>

                {!isLocationSet && (
                    <div className="mb-8 bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-start gap-4">
                        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <h3 className="text-rose-900 font-bold text-lg">{t('settings.location_not_set')}</h3>
                            <p className="text-rose-700/80 font-medium mt-1">
                                {t('settings.location_not_set_desc')}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Store Info */}
                    <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6 hover:shadow-md hover:border-indigo-100 transition-all duration-300 h-fit">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-800">{t('settings.store_identity')}</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">{t('settings.store_name')}</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="My Awesome Store"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">{t('settings.store_url')}</label>
                                <input
                                    type="text"
                                    value={formData.domain}
                                    onChange={(e) => {
                                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                        setFormData({ ...formData, domain: val });
                                    }}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="my-store"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-50 mt-4"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {loading ? 'Saving...' : t('settings.save')}
                        </button>
                    </div>

                    {/* Map Section */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6 hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800">{t('settings.store_location')}</h2>
                            </div>

                            <div className="flex items-center gap-2">
                                {isLocationSet && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${isEditing
                                            ? 'bg-slate-100 text-slate-600'
                                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            }`}
                                    >
                                        {isEditing ? t('settings.cancel_edit') : t('settings.edit_location')}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleDetectLocation}
                                    disabled={detecting || (!isEditing && isLocationSet)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${isLocationSet
                                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                        : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200'
                                        } ${(!isEditing && isLocationSet) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {detecting ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Navigation className="w-4 h-4" />
                                    )}
                                    {detecting ? t('settings.detecting') : (isLocationSet ? t('settings.reset_gps') : t('settings.detect_gps'))}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">{t('settings.latitude')}</span>
                                <div className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-slate-900 font-bold">
                                    {position[0].toFixed(6)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">{t('settings.longitude')}</span>
                                <div className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-slate-900 font-bold">
                                    {position[1].toFixed(6)}
                                </div>
                            </div>
                        </div>

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
                            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isEditing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                <p className="text-[10px] font-bold text-slate-600">
                                    {isEditing ? t('settings.map_pick') : t('settings.map_locked')}
                                </p>
                            </div>
                        </div>
                    </div>
                </form>

                {/* AI Tuning Section */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-8 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">AI Personality & Prompts</h2>
                                <p className="text-slate-500 font-medium">Customize how the AI behaves for your customers</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveConfig}
                            disabled={configLoading}
                            className="bg-violet-600 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {configLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {configLoading ? 'Saving...' : 'Save AI Config'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Registered User Prompt */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Registered User Prompt</h3>
                            </div>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                                instructions for AI when talking to logged-in customers.
                            </p>
                            <textarea
                                value={config.aiSystemPrompt}
                                onChange={(e) => setConfig({ ...config, aiSystemPrompt: e.target.value })}
                                className="w-full h-48 px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none text-slate-700 font-medium text-sm leading-relaxed resize-none shadow-inner"
                                placeholder="Enter system prompt for registered users..."
                            />
                            <div className="flex justify-start">
                                <button
                                    onClick={() => setConfig({ ...config, aiSystemPrompt: defaultRegPrompt })}
                                    className="text-[10px] font-bold text-violet-600 hover:text-violet-700 uppercase tracking-widest flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" /> Reset to Default
                                </button>
                            </div>
                        </div>

                        {/* Guest User Prompt */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Guest User Prompt</h3>
                            </div>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                                Instructions for AI when talking to anonymous guests.
                            </p>
                            <textarea
                                value={config.aiGuestSystemPrompt}
                                onChange={(e) => setConfig({ ...config, aiGuestSystemPrompt: e.target.value })}
                                className="w-full h-48 px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none text-slate-700 font-medium text-sm leading-relaxed resize-none shadow-inner"
                                placeholder="Enter system prompt for guest users..."
                            />
                            <div className="flex justify-start">
                                <button
                                    onClick={() => setConfig({ ...config, aiGuestSystemPrompt: defaultGuestPrompt })}
                                    className="text-[10px] font-bold text-violet-600 hover:text-violet-700 uppercase tracking-widest flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" /> Reset to Default
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Creativity (Temperature)</label>
                                <span className="bg-violet-100 text-violet-700 font-bold px-3 py-1 rounded-full text-xs">{(config.aiTemperature || 0.7).toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={config.aiTemperature || 0.7}
                                onChange={(e) => setConfig({ ...config, aiTemperature: parseFloat(e.target.value) })}
                                className="w-full accent-violet-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <span>Strict</span>
                                <span>Creative</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Max Tokens</label>
                                <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-xs">{config.aiMaxTokens || 500}</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="2048"
                                step="50"
                                value={config.aiMaxTokens || 500}
                                onChange={(e) => setConfig({ ...config, aiMaxTokens: parseInt(e.target.value) })}
                                className="w-full accent-indigo-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <span>Short</span>
                                <span>Long</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreSettings;
