export type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  province?: string;
  countryCode: string;
};

export type UserProfile = {
  id: string;
  name: string;
  minSpeed: number;
  maxSpeed: number;
  avgFuelConsumptionPerHour: number;
  setupName?: string;
  emergencyContact?: string;
};

export type Flight = {
  id: string;
  name: string;
  places: Place[];
  totalDistanceKm: number;
  estimatedDurationHours: number;
  estimatedFuelLiters: number;
  createdAt: string;
  updatedAt: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
  isDefault: boolean;
};

export type FlightDraft = {
  name: string;
  places: Array<Place | null>;
};

export type FlightEstimates = {
  totalDistanceKm: number;
  estimatedDurationHours: number;
  estimatedFuelLiters: number;
};
