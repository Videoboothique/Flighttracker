import { ChecklistItem, Flight, Place, UserProfile } from '../types';

export const NETHERLANDS_REGION = {
  latitude: 52.1326,
  longitude: 5.2913,
  latitudeDelta: 3.8,
  longitudeDelta: 3.8,
};

export const PLACE_SLOTS = [
  'Startstad',
  'Tussenstop 1',
  'Tussenstop 2',
  'Tussenstop 3',
  'Eindstad',
] as const;

export const defaultProfile: UserProfile = {
  id: 'profile-robert-jan',
  name: 'Robert-Jan',
  minSpeed: 35,
  maxSpeed: 50,
  avgFuelConsumptionPerHour: 4,
  setupName: 'Paramotor Setup',
  emergencyContact: '',
};

const amsterdam: Place = {
  id: 'seed-amsterdam',
  name: 'Amsterdam',
  latitude: 52.3676,
  longitude: 4.9041,
  province: 'Noord-Holland',
  countryCode: 'nl',
};

const utrecht: Place = {
  id: 'seed-utrecht',
  name: 'Utrecht',
  latitude: 52.0907,
  longitude: 5.1214,
  province: 'Utrecht',
  countryCode: 'nl',
};

const arnhem: Place = {
  id: 'seed-arnhem',
  name: 'Arnhem',
  latitude: 51.9851,
  longitude: 5.8987,
  province: 'Gelderland',
  countryCode: 'nl',
};

const eindhoven: Place = {
  id: 'seed-eindhoven',
  name: 'Eindhoven',
  latitude: 51.4416,
  longitude: 5.4697,
  province: 'Noord-Brabant',
  countryCode: 'nl',
};

const groningen: Place = {
  id: 'seed-groningen',
  name: 'Groningen',
  latitude: 53.2194,
  longitude: 6.5665,
  province: 'Groningen',
  countryCode: 'nl',
};

const zwolle: Place = {
  id: 'seed-zwolle',
  name: 'Zwolle',
  latitude: 52.5168,
  longitude: 6.083,
  province: 'Overijssel',
  countryCode: 'nl',
};

export const seedFlights: Flight[] = [
  {
    id: 'flight-1',
    name: 'Ochtendvlucht Randstad',
    places: [amsterdam, utrecht],
    totalDistanceKm: 0,
    estimatedDurationHours: 0,
    estimatedFuelLiters: 0,
    createdAt: '2026-03-12T08:30:00.000Z',
    updatedAt: '2026-03-12T08:30:00.000Z',
  },
  {
    id: 'flight-2',
    name: 'Rivierenroute',
    places: [utrecht, arnhem, eindhoven],
    totalDistanceKm: 0,
    estimatedDurationHours: 0,
    estimatedFuelLiters: 0,
    createdAt: '2026-02-21T10:15:00.000Z',
    updatedAt: '2026-02-21T10:15:00.000Z',
  },
  {
    id: 'flight-3',
    name: 'Noordelijke verkenning',
    places: [zwolle, groningen],
    totalDistanceKm: 0,
    estimatedDurationHours: 0,
    estimatedFuelLiters: 0,
    createdAt: '2026-01-18T14:00:00.000Z',
    updatedAt: '2026-01-18T14:00:00.000Z',
  },
];

export const defaultChecklistItems: ChecklistItem[] = [
  { id: 'cl-1', label: 'Brandstof gecontroleerd', completed: false, isDefault: true },
  { id: 'cl-2', label: 'Helm ingepakt', completed: false, isDefault: true },
  { id: 'cl-3', label: 'Harnas gecontroleerd', completed: false, isDefault: true },
  { id: 'cl-4', label: 'Scherm gecontroleerd', completed: false, isDefault: true },
  { id: 'cl-5', label: 'Lijnen gecontroleerd', completed: false, isDefault: true },
  { id: 'cl-6', label: 'Motor gecontroleerd', completed: false, isDefault: true },
  { id: 'cl-7', label: 'Weer gecontroleerd', completed: false, isDefault: true },
  { id: 'cl-8', label: 'Telefoon opgeladen', completed: false, isDefault: true },
  { id: 'cl-9', label: 'Noodcontact beschikbaar', completed: false, isDefault: true },
];
