import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

/**
 * Decodes a polyline string into an array of LatLng points.
 * @param encoded The encoded polyline string.
 * @returns An array of latitude/longitude objects.
 */
function decode(encoded: string): { lat: number; lng: number }[] {
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    const path: { lat: number; lng: number }[] = [];

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        path.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return path;
}


/**
 * Fetches directions from Google Maps API.
 * @param origin The starting location.
 * @param destination The destination location.
 * @returns A structured object with route information or null if no route is found.
 */
export async function getDirections(origin: string, destination: string) {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
        throw new Error("GOOGLE_MAPS_API_KEY is not set in the environment variables.");
    }
    try {
        const response = await client.directions({
            params: {
                origin,
                destination,
                key: process.env.GOOGLE_MAPS_API_KEY,
                mode: 'driving', // We'll use driving mode for bus routes
            },
        });

        const route = response.data.routes[0];
        if (!route) {
            return null;
        }

        const leg = route.legs[0];
        if (!leg) {
            return null;
        }

        const distanceKm = leg.distance.value / 1000; // convert meters to km
        const durationMinutes = leg.duration.value / 60; // convert seconds to minutes

        const routePath = decode(route.overview_polyline.points);

        return {
            distance: Math.round(distanceKm),
            duration: Math.round(durationMinutes),
            routePath,
            summary: route.summary,
        };

    } catch (error: any) {
        console.error("Error fetching directions from Google Maps:", error.response?.data?.error_message || error.message);
        throw new Error(error.response?.data?.error_message || "An unexpected error occurred with the Google Maps service.");
    }
}
