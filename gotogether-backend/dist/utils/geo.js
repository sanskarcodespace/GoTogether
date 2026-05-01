"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPointNearPolyline = exports.closestPointOnSegment = exports.decodePolyline = exports.calculateDistance = void 0;
/**
 * Haversine formula to calculate distance between two points in km
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
exports.calculateDistance = calculateDistance;
/**
 * Decode Google Maps encoded polyline
 */
const decodePolyline = (encoded) => {
    const points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = result & 1 ? ~(result >> 1) : result >> 1;
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = result & 1 ? ~(result >> 1) : result >> 1;
        lng += dlng;
        points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
};
exports.decodePolyline = decodePolyline;
/**
 * Find closest point on a line segment to a point
 */
const closestPointOnSegment = (p, a, b) => {
    const [px, py] = p;
    const [ax, ay] = a;
    const [bx, by] = b;
    const dx = bx - ax;
    const dy = by - ay;
    if (dx === 0 && dy === 0)
        return a;
    const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    if (t < 0)
        return a;
    if (t > 1)
        return b;
    return [ax + t * dx, ay + t * dy];
};
exports.closestPointOnSegment = closestPointOnSegment;
/**
 * Check if a point is near a polyline within a threshold km
 */
const isPointNearPolyline = (point, polyline, thresholdKm) => {
    let minDistance = Infinity;
    let closestPoint = [0, 0];
    for (let i = 0; i < polyline.length - 1; i++) {
        const cp = (0, exports.closestPointOnSegment)(point, polyline[i], polyline[i + 1]);
        const dist = (0, exports.calculateDistance)(point[0], point[1], cp[0], cp[1]);
        if (dist < minDistance) {
            minDistance = dist;
            closestPoint = cp;
        }
    }
    return {
        isNear: minDistance <= thresholdKm,
        minDistance,
        closestPoint,
    };
};
exports.isPointNearPolyline = isPointNearPolyline;
