import { Flight, FlightEstimates, Place, UserProfile } from '../types';

const EARTH_RADIUS_KM = 6371;

const toRadians = (value: number) => (value * Math.PI) / 180;

export const calculateSegmentDistanceKm = (from: Place, to: Place) => {
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

export const calculateRouteDistanceKm = (places: Place[]) => {
  if (places.length < 2) {
    return 0;
  }

  return places.slice(1).reduce((total, place, index) => {
    return total + calculateSegmentDistanceKm(places[index], place);
  }, 0);
};

export const calculateFlightEstimates = (
  places: Place[],
  profile: UserProfile,
): FlightEstimates => {
  const totalDistanceKm = calculateRouteDistanceKm(places);
  const averageSpeed = (profile.minSpeed + profile.maxSpeed) / 2;
  const safeAverageSpeed = averageSpeed > 0 ? averageSpeed : 1;
  const estimatedDurationHours = totalDistanceKm / safeAverageSpeed;
  const estimatedFuelLiters =
    estimatedDurationHours * Math.max(profile.avgFuelConsumptionPerHour, 0);

  return {
    totalDistanceKm,
    estimatedDurationHours,
    estimatedFuelLiters,
  };
};

export const withCalculatedFlight = (flight: Flight, profile: UserProfile): Flight => {
  const estimates = calculateFlightEstimates(flight.places, profile);

  return {
    ...flight,
    ...estimates,
  };
};
