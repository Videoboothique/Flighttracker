import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { defaultChecklistItems, defaultProfile, seedFlights } from '../constants/defaults';
import { STORAGE_KEYS } from '../storage/keys';
import { ChecklistItem, Flight, UserProfile } from '../types';
import { withCalculatedFlight } from '../utils/calculations';

type AppContextValue = {
  isLoaded: boolean;
  profile: UserProfile;
  flights: Flight[];
  checklistItems: ChecklistItem[];
  saveProfile: (profile: UserProfile) => Promise<void>;
  saveFlight: (flight: Omit<Flight, 'totalDistanceKm' | 'estimatedDurationHours' | 'estimatedFuelLiters'>) => Promise<void>;
  deleteFlight: (flightId: string) => Promise<void>;
  toggleChecklistItem: (itemId: string) => Promise<void>;
  addChecklistItem: (label: string) => Promise<void>;
  deleteChecklistItem: (itemId: string) => Promise<void>;
  resetChecklist: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const seedCalculatedFlights = seedFlights.map((flight) => withCalculatedFlight(flight, defaultProfile));

export function AppProvider({ children }: PropsWithChildren) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [flights, setFlights] = useState<Flight[]>(seedCalculatedFlights);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(defaultChecklistItems);

  useEffect(() => {
    const load = async () => {
      try {
        const [storedProfile, storedFlights, storedChecklist] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.profile),
          AsyncStorage.getItem(STORAGE_KEYS.flights),
          AsyncStorage.getItem(STORAGE_KEYS.checklist),
        ]);

        const nextProfile = storedProfile ? (JSON.parse(storedProfile) as UserProfile) : defaultProfile;
        const nextFlightsBase = storedFlights ? (JSON.parse(storedFlights) as Flight[]) : seedFlights;
        const nextChecklist = storedChecklist
          ? (JSON.parse(storedChecklist) as ChecklistItem[])
          : defaultChecklistItems;

        setProfile(nextProfile);
        setFlights(nextFlightsBase.map((flight) => withCalculatedFlight(flight, nextProfile)));
        setChecklistItems(nextChecklist);
      } finally {
        setIsLoaded(true);
      }
    };

    void load();
  }, []);

  const persistFlights = async (nextFlights: Flight[]) => {
    setFlights(nextFlights);
    await AsyncStorage.setItem(STORAGE_KEYS.flights, JSON.stringify(nextFlights));
  };

  const saveProfile = async (nextProfile: UserProfile) => {
    setProfile(nextProfile);
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(nextProfile));

    const recalculatedFlights = flights.map((flight) => withCalculatedFlight(flight, nextProfile));
    await persistFlights(recalculatedFlights);
  };

  const saveFlight = async (
    flight: Omit<Flight, 'totalDistanceKm' | 'estimatedDurationHours' | 'estimatedFuelLiters'>,
  ) => {
    const computedFlight = withCalculatedFlight(flight as Flight, profile);
    const existingIndex = flights.findIndex((item) => item.id === computedFlight.id);
    const nextFlights =
      existingIndex >= 0
        ? flights.map((item) => (item.id === computedFlight.id ? computedFlight : item))
        : [computedFlight, ...flights];

    await persistFlights(nextFlights);
  };

  const deleteFlight = async (flightId: string) => {
    await persistFlights(flights.filter((flight) => flight.id !== flightId));
  };

  const toggleChecklistItem = async (itemId: string) => {
    const nextItems = checklistItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );
    setChecklistItems(nextItems);
    await AsyncStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(nextItems));
  };

  const addChecklistItem = async (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) {
      return;
    }

    const nextItems = [
      ...checklistItems,
      { id: `custom-${Date.now()}`, label: trimmed, completed: false, isDefault: false },
    ];

    setChecklistItems(nextItems);
    await AsyncStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(nextItems));
  };

  const deleteChecklistItem = async (itemId: string) => {
    const nextItems = checklistItems.filter((item) => item.id !== itemId);
    setChecklistItems(nextItems);
    await AsyncStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(nextItems));
  };

  const resetChecklist = async () => {
    const nextItems = checklistItems.map((item) => ({ ...item, completed: false }));
    setChecklistItems(nextItems);
    await AsyncStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(nextItems));
  };

  const value = useMemo(
    () => ({
      isLoaded,
      profile,
      flights,
      checklistItems,
      saveProfile,
      saveFlight,
      deleteFlight,
      toggleChecklistItem,
      addChecklistItem,
      deleteChecklistItem,
      resetChecklist,
    }),
    [isLoaded, profile, flights, checklistItems],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext moet binnen AppProvider worden gebruikt.');
  }

  return context;
};
