import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const doctorIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const DoctorMap = ({ doctors, specialization, location }) => {
    if (!doctors || doctors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-white/20 bg-forensic-surface/30">
                <span className="text-4xl mb-3">🗺️</span>
                <p className="terminal-text text-forensic-muted text-xs">NO_LOCATIONS_FOUND</p>
                <p className="text-xs text-forensic-muted mt-1 font-sans">
                    Try a different location or medical condition
                </p>
            </div>
        );
    }

    // Calculate map center from first doctor's coordinates
    const centerLat = doctors[0].latitude;
    const centerLng = doctors[0].longitude;

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🏥</span>
                    <span className="terminal-text text-forensic-cyan text-[10px]">
                        SPECIALIST_MAP
                    </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 border border-forensic-emerald/40 text-forensic-emerald bg-forensic-emerald-dim font-mono uppercase">
                    {specialization || 'General'}
                </span>
            </div>

            {/* Map */}
            <div className="w-full h-64 border border-white/10 overflow-hidden" style={{ borderRadius: 0 }}>
                <MapContainer
                    center={[centerLat, centerLng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {doctors.map((doc, idx) => (
                        <Marker
                            key={idx}
                            position={[doc.latitude, doc.longitude]}
                            icon={doctorIcon}
                        >
                            <Popup>
                                <div className="min-w-[180px]">
                                    <h3 className="font-bold text-sm mb-1">{doc.name}</h3>
                                    <p className="text-xs text-purple-700 font-semibold mb-1">
                                        🩺 {doc.specialization}
                                    </p>
                                    {doc.address && (
                                        <p className="text-xs text-gray-600 mb-1">📍 {doc.address}</p>
                                    )}
                                    {doc.phone && (
                                        <p className="text-xs text-gray-600 mb-1">📞 {doc.phone}</p>
                                    )}
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${doc.latitude},${doc.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline font-semibold"
                                    >
                                        🧭 Get Directions
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Doctor List */}
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {doctors.slice(0, 8).map((doc, idx) => (
                    <div
                        key={idx}
                        className="p-2 bg-forensic-surface border border-white/10 hover:border-forensic-cyan transition-colors text-xs group"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="font-bold text-forensic-text group-hover:text-forensic-cyan transition-colors">
                                    {doc.name}
                                </span>
                                <div className="text-forensic-muted mt-0.5">
                                    🩺 {doc.specialization}
                                </div>
                            </div>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${doc.latitude},${doc.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] px-2 py-0.5 border border-forensic-cyan/30 text-forensic-cyan bg-forensic-cyan/10 font-mono hover:bg-forensic-cyan/20 transition-colors"
                            >
                                NAVIGATE
                            </a>
                        </div>
                        {doc.address && (
                            <div className="text-forensic-muted mt-1 text-[10px]">
                                📍 {doc.address}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorMap;
