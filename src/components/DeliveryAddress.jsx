import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Home, Briefcase, GraduationCap, X, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

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

// Helper to update map view when position changes
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 16);
        }
    }, [center, map]);
    return null;
}

const DeliveryAddress = ({ onAddressSelect, initialAddress = "" }) => {
    const [searchQuery, setSearchQuery] = useState(initialAddress);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [position, setPosition] = useState([10.762622, 106.660172]); // Default: TP.HCM
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [errors, setErrors] = useState({});
    const [isManualMoving, setIsManualMoving] = useState(false);

    const searchTimeout = useRef(null);

    // Handle Search Input
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setShowSuggestions(true);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (query.length > 2) {
            setIsLoading(true);
            searchTimeout.current = setTimeout(async () => {
                try {
                    const response = await axios.get(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5&addressdetails=1`
                    );
                    setSuggestions(response.data);
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setIsLoading(false);
                }
            }, 500);
        } else {
            setSuggestions([]);
            setIsLoading(false);
        }
    };

    // Handle Suggestion Selection
    const handleSelectSuggestion = (suggestion) => {
        const pos = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
        setPosition(pos);
        setSelectedAddress({
            display_name: suggestion.display_name,
            lat: suggestion.lat,
            lon: suggestion.lon
        });
        setSearchQuery(suggestion.display_name);
        setShowSuggestions(false);
        setErrors(prev => ({ ...prev, address: null }));
    };

    // Handle Map Marker Drag/Click
    const DraggableMarker = () => {
        const markerRef = useRef(null);
        const eventHandlers = useMemo(
            () => ({
                dragend() {
                    const marker = markerRef.current;
                    if (marker != null) {
                        const newPos = marker.getLatLng();
                        setPosition([newPos.lat, newPos.lng]);
                        reverseGeocode(newPos.lat, newPos.lng);
                    }
                },
            }),
            [],
        );

        return (
            <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={position}
                ref={markerRef}>
            </Marker>
        );
    };

    // Reverse Geocoding when moving pin
    const reverseGeocode = async (lat, lon) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
            );
            if (response.data) {
                const addr = response.data.display_name;
                setSelectedAddress({
                    display_name: addr,
                    lat: lat,
                    lon: lon
                });
                setSearchQuery(addr);
                setErrors(prev => ({ ...prev, address: null }));
            }
        } catch (error) {
            console.error("Reverse geocode error:", error);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!selectedAddress) newErrors.address = "Vui lòng chọn địa chỉ giao hàng";
        if (!phoneNumber) newErrors.phone = "Vui lòng nhập số điện thoại";
        else if (!/^\d{10,11}$/.test(phoneNumber)) newErrors.phone = "Số điện thoại không hợp lệ";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = () => {
        if (validate()) {
            onAddressSelect?.({
                ...selectedAddress,
                phoneNumber
            });
            alert("Địa chỉ đã được xác nhận!");
        }
    };

    const quickLinks = [
        { icon: <Home size={18} />, label: "Nhà riêng", color: "bg-blue-50 text-blue-600 border-blue-100" },
        { icon: <Briefcase size={18} />, label: "Công ty", color: "bg-purple-50 text-purple-600 border-purple-100" },
        { icon: <GraduationCap size={18} />, label: "Trường học", color: "bg-orange-50 text-orange-600 border-orange-100" },
    ];

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 font-sans">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-xl">
                        <MapPin className="text-red-500" size={24} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Địa chỉ giao hàng</h2>
                        <p className="text-xs text-gray-500">Vui lòng chọn chính xác vị trí nhận hàng</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Search Bar */}
                <div className="relative group">
                    <div className={`flex items-center bg-gray-50 rounded-2xl border-2 transition-all duration-300 px-4 py-3.5 ${errors.address ? 'border-red-400 shadow-sm shadow-red-100' : 'border-transparent focus-within:border-green-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-green-50/50'}`}>
                        <Search className={`${errors.address ? 'text-red-400' : 'text-gray-400 group-focus-within:text-green-500'} transition-colors`} size={20} />
                        <input
                            type="text"
                            placeholder="Tìm địa chỉ, tòa nhà, tên đường..."
                            className="bg-transparent border-none outline-none w-full ml-3 text-gray-700 placeholder:text-gray-400 font-medium"
                            value={searchQuery}
                            onChange={handleSearch}
                            onFocus={() => setShowSuggestions(true)}
                        />
                        {searchQuery && (
                            <button onClick={() => { setSearchQuery(""); setSuggestions([]); }} className="text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                        {showSuggestions && (suggestions.length > 0 || isLoading) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-72 overflow-y-auto"
                            >
                                {isLoading ? (
                                    <div className="p-4 flex items-center justify-center gap-2 text-gray-500">
                                        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang tìm kiếm...</span>
                                    </div>
                                ) : (
                                    suggestions.map((s, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectSuggestion(s)}
                                            className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-50 last:border-none transition-colors"
                                        >
                                            <MapPin size={18} className="text-gray-400 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-gray-800 font-semibold text-sm line-clamp-1">{s.display_name.split(',')[0]}</p>
                                                <p className="text-gray-500 text-xs line-clamp-2 mt-0.5">{s.display_name}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {errors.address && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 ml-1 font-medium">
                            <AlertCircle size={12} /> {errors.address}
                        </p>
                    )}
                </div>

                {/* Quick Links */}
                <div className="flex flex-wrap gap-3">
                    {quickLinks.map((link, idx) => (
                        <button
                            key={idx}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${link.color}`}
                        >
                            {link.icon}
                            {link.label}
                        </button>
                    ))}
                </div>

                {/* Map View */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Navigation size={16} className="text-green-600" />
                            Xác nhận vị trí trên bản đồ
                        </label>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Có thể kéo ghim</span>
                    </div>
                    <div className="h-64 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 relative z-0">
                        <MapContainer 
                            center={position} 
                            zoom={16} 
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <ChangeView center={position} />
                            <DraggableMarker />
                        </MapContainer>
                        <div className="absolute bottom-4 right-4 z-10">
                            <button 
                                onClick={() => {
                                    navigator.geolocation.getCurrentPosition((pos) => {
                                        const newPos = [pos.coords.latitude, pos.coords.longitude];
                                        setPosition(newPos);
                                        reverseGeocode(newPos[0], newPos[1]);
                                    });
                                }}
                                className="bg-white p-2.5 rounded-xl shadow-lg border border-gray-100 text-green-600 hover:bg-green-50 transition-colors"
                            >
                                <Navigation size={20} fill="currentColor" fillOpacity={0.2} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Số điện thoại liên lạc</label>
                        <div className={`flex items-center bg-gray-50 rounded-2xl border-2 transition-all duration-300 px-4 py-3.5 ${errors.phone ? 'border-red-400' : 'border-transparent focus-within:border-green-500 focus-within:bg-white'}`}>
                            <span className="text-gray-500 font-bold border-r pr-3 mr-3">+84</span>
                            <input
                                type="tel"
                                placeholder="Nhập số điện thoại của bạn"
                                className="bg-transparent border-none outline-none w-full text-gray-700 placeholder:text-gray-400 font-medium"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1 ml-1 font-medium">
                                <AlertCircle size={12} /> {errors.phone}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                    >
                        <CheckCircle2 size={20} />
                        Xác nhận địa chỉ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryAddress;
