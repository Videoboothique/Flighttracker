import { Place } from '../types';

type NominatimItem = {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country_code?: string;
  };
};

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export const searchDutchCities = async (query: string): Promise<Place[]> => {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return [];
  }

  const url = `${NOMINATIM_URL}?format=jsonv2&addressdetails=1&limit=8&countrycodes=nl&featureType=city&q=${encodeURIComponent(
    trimmed,
  )}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'nl',
    },
  });

  if (!response.ok) {
    throw new Error('Zoeken naar steden is mislukt.');
  }

  const data = (await response.json()) as NominatimItem[];

  return data
    .filter((item) => item.address?.country_code?.toLowerCase() === 'nl')
    .map((item) => ({
      id: `nominatim-${item.place_id}`,
      name:
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.address?.municipality ||
        item.name ||
        item.display_name.split(',')[0],
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      province: item.address?.state,
      countryCode: item.address?.country_code?.toLowerCase() ?? 'nl',
    }))
    .filter(
      (place, index, places) =>
        place.name &&
        places.findIndex(
          (candidate) =>
            candidate.name === place.name &&
            candidate.latitude === place.latitude &&
            candidate.longitude === place.longitude,
        ) === index,
    );
};
