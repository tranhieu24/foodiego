/**
 * Calculates the distance between two points in kilometers using the Haversine formula
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

/**
 * Calculates shipping fee based on distance
 * @param {number} distance Distance in kilometers
 * @returns {number} Shipping fee in VND
 */
const calculateShippingFee = (distance) => {
  const baseFee = 15000; // Minimum fee for first 2km
  const feePerKm = 5000; // Additional fee per km after 2km
  
  if (distance <= 2) {
    return baseFee;
  }
  
  const additionalDistance = distance - 2;
  const additionalFee = Math.ceil(additionalDistance) * feePerKm;
  
  return baseFee + additionalFee;
};

export default {;
  calculateDistance,
  calculateShippingFee,
};
