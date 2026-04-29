import React from 'react';
import DeliveryAddress from '../components/DeliveryAddress';

const AddressTestPage = () => {
    const handleAddressSelect = (data) => {
        console.log("Selected Address Data:", data);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Address Component Demo</h1>
                    <p className="text-gray-500">Thử nghiệm component địa chỉ phong cách GrabFood</p>
                </div>
                
                <DeliveryAddress onAddressSelect={handleAddressSelect} />

                <div className="mt-12 bg-blue-50 p-6 rounded-2xl border border-blue-100 max-w-2xl mx-auto">
                    <h3 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                        💡 Tính năng tích hợp:
                    </h3>
                    <ul className="text-blue-700 text-sm space-y-2 list-disc list-inside">
                        <li>Tìm kiếm địa chỉ với <b>Nominatim API</b> (OpenStreetMap)</li>
                        <li>Bản đồ tương tác với <b>Leaflet</b></li>
                        <li>Ghim vị trí có thể <b>kéo thả (Draggable Marker)</b></li>
                        <li>Tự động lấy tên địa chỉ khi di chuyển ghim (Reverse Geocoding)</li>
                        <li>Hiệu ứng mượt mà với <b>Framer Motion</b></li>
                        <li>Validation số điện thoại và địa chỉ với Tailwind styling</li>
                        <li>Gợi ý nhanh (Nhà riêng, Công ty, Trường học)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AddressTestPage;
