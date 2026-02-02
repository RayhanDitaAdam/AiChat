import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const StoreMap = ({ stores, userLocation, zoom = 13 }) => {
    // Default center to first store or user location or Jakarta
    const center = stores && stores.length > 0
        ? [stores[0].latitude, stores[0].longitude]
        : (userLocation ? [userLocation.lat, userLocation.lng] : [-6.2088, 106.8456]);

    return (
        <div className="w-full h-[300px] rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm mt-4 z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]}>
                        <Popup>
                            <span className="font-bold">You are here</span>
                        </Popup>
                    </Marker>
                )}

                {stores && stores.map((store) => (
                    <Marker
                        key={store.id}
                        position={[store.latitude, store.longitude]}
                    >
                        <Popup>
                            <div className="p-1">
                                <h4 className="font-black uppercase italic text-slate-900 text-xs">{store.name}</h4>
                                <p className="text-[10px] text-slate-500 font-medium">{store.domain}</p>
                                {store.distance && (
                                    <p className="text-[9px] font-black text-indigo-600 mt-1 uppercase tracking-widest">
                                        {store.distance.toFixed(1)} km away
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default StoreMap;
