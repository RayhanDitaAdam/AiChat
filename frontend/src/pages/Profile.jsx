import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { User, Printer, Save, Smartphone, MapPin, Globe } from 'lucide-react';
import api from '../services/api.js';
import MembershipCard from '../components/MembershipCard.jsx';
import { useToast } from '../context/ToastContext.js';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const Profile = () => {
    const { user, setUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        password: '',
        confirmPassword: '',
        printerIp: user?.printerIp || '',
        printerPort: user?.printerPort || 9100,
        language: user?.language || 'id',
        phone: user?.phone || '',
        latitude: user?.latitude || -6.200000,
        longitude: user?.longitude || 106.816666
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
                currentPassword: '',
                password: '',
                confirmPassword: '',
                printerIp: user.printerIp || '',
                printerPort: user.printerPort || 9100,
                language: user.language || 'id',
                phone: user.phone || '',
                latitude: user.latitude || -6.200000,
                longitude: user.longitude || 106.816666
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

        // Validate password fields
        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', content: 'Passwords do not match' });
            setLoading(false);
            return;
        }

        // Prepare data (exclude empty password fields and confirmPassword)
        const submitData = { ...formData };
        delete submitData.confirmPassword;
        if (!submitData.password) {
            delete submitData.password;
            delete submitData.currentPassword;
        }

        try {
            const response = await api.patch('/auth/profile', submitData);
            if (response.data.status === 'success') {
                setMessage({ type: 'success', content: 'Profile updated successfully!' });
                setUser(response.data.user);
                // Clear password fields
                setFormData(prev => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }));
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

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
                <p className="text-slate-500 font-medium">Manage your account and printer configurations</p>
            </div>

            {/* Membership Card */}
            <div className="mb-10 w-full flex justify-center">
                <MembershipCard user={user} />
            </div>

            {!isLocationSet && (
                <div className="mb-8 bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <h3 className="text-rose-900 font-black text-lg">Location Not Set</h3>
                        <p className="text-rose-700/80 font-md mt-1">
                            Please set your home location to receive better AI recommendations for nearby stores and products.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <User className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="+628123456789"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Language / Bahasa</label>
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
                            <h2 className="text-xl font-black text-slate-800">Home Location</h2>
                        </div>

                        <div className="flex items-center gap-2">
                            {isLocationSet && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isEditing
                                        ? 'bg-slate-100 text-slate-600'
                                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                        }`}
                                >
                                    {isEditing ? 'Cancel Edit' : 'Edit Location'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleDetectLocation}
                                disabled={detecting || (!isEditing && isLocationSet)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isLocationSet
                                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200'
                                    } ${(!isEditing && isLocationSet) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {detecting ? (
                                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                ) : (
                                    <MapPin className="w-4 h-4" />
                                )}
                                {detecting ? 'Detecting...' : (isLocationSet ? 'Reset to GPS Location' : 'Detect GPS Location')}
                            </button>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 mb-6 font-medium">Set your home location to help the AI suggest stores and products near you. Click on the map or drag the marker to your position.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude</span>
                            <div className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-slate-900 font-bold">
                                {position[0].toFixed(6)}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitude</span>
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
                                {isEditing ? 'Click or drag marker to pick location' : 'Map View (Locked)'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Printer Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <Printer className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Printer Configuration</h2>
                    </div>

                    <p className="text-sm text-slate-500 mb-6"> Configure your network printer for direct thermal receipt printing. Make sure your printer is on the same network!</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Printer IP Address</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="printerIp"
                                    value={formData.printerIp}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="192.168.1.100"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Printer Port</label>
                            <input
                                type="number"
                                name="printerPort"
                                value={formData.printerPort}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                placeholder="9100"
                            />
                        </div>
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
                    </div>

                    <p className="text-sm text-slate-500 mb-6">Update your password to keep your account secure.</p>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="Min. 8 characters"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Message */}
                {message.content && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                        {message.content}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
