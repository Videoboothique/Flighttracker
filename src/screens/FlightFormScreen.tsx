import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CityAutocompleteField } from '../components/CityAutocompleteField';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { RouteMap } from '../components/RouteMap';
import { SectionHeader } from '../components/SectionHeader';
import { PLACE_SLOTS } from '../constants/defaults';
import { colors, radii, spacing } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { FlightsStackParamList } from '../navigation/AppNavigator';
import { Place } from '../types';
import { calculateFlightEstimates } from '../utils/calculations';
import { formatDistance, formatDuration, formatFuel } from '../utils/format';

type Props = NativeStackScreenProps<FlightsStackParamList, 'VluchtAanmaken' | 'VluchtBewerken'>;

export function FlightFormScreen({ navigation, route }: Props) {
  const { flights, profile, saveFlight } = useAppContext();
  const flightId = route.params?.flightId;
  const editingFlight = flightId
    ? flights.find((flight) => flight.id === flightId)
    : undefined;

  const [name, setName] = useState(editingFlight?.name ?? '');
  const [places, setPlaces] = useState<Array<Place | null>>(() => {
    const base = [null, null, null, null, null] as Array<Place | null>;
    editingFlight?.places.forEach((place, index) => {
      if (index < base.length) {
        base[index] = place;
      }
    });
    return base;
  });
  const [isSaving, setIsSaving] = useState(false);

  const selectedPlaces = useMemo(() => places.filter(Boolean) as Place[], [places]);
  const estimates = useMemo(
    () => calculateFlightEstimates(selectedPlaces, profile),
    [selectedPlaces, profile],
  );

  const updatePlace = (index: number, place: Place | null) => {
    setPlaces((current) => {
      const next = [...current];
      next[index] = place;
      return next;
    });
  };

  const handleSave = async () => {
    const filteredPlaces = places.filter(Boolean) as Place[];

    if (!name.trim()) {
      Alert.alert('Naam ontbreekt', 'Geef de vlucht een duidelijke naam.');
      return;
    }

    if (filteredPlaces.length < 2) {
      Alert.alert('Route onvolledig', 'Kies minimaal een startstad en een eindstad.');
      return;
    }

    setIsSaving(true);
    const now = new Date().toISOString();

    await saveFlight({
      id: editingFlight?.id ?? `flight-${Date.now()}`,
      name: name.trim(),
      places: filteredPlaces,
      createdAt: editingFlight?.createdAt ?? now,
      updatedAt: now,
    });

    setIsSaving(false);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader
        title={editingFlight ? 'Vlucht aanpassen' : 'Nieuwe vlucht'}
        subtitle="Stel een route samen met Nederlandse plaatsen en bekijk direct de schattingen."
      />

      <View style={styles.card}>
        <FormField
          label="Naam van de vlucht"
          value={name}
          onChangeText={setName}
          placeholder="Bijvoorbeeld avondvlucht Veluwe"
        />

        {PLACE_SLOTS.map((slot, index) => (
          <CityAutocompleteField
            key={slot}
            label={slot}
            value={places[index]}
            onSelect={(place) => updatePlace(index, place)}
          />
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Routekaart</Text>
        <RouteMap places={selectedPlaces} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Schatting</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Afstand</Text>
          <Text style={styles.summaryValue}>{formatDistance(estimates.totalDistanceKm)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duur</Text>
          <Text style={styles.summaryValue}>{formatDuration(estimates.estimatedDurationHours)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Brandstof</Text>
          <Text style={styles.summaryValue}>{formatFuel(estimates.estimatedFuelLiters)}</Text>
        </View>
        <Text style={styles.helperText}>
          Berekening met gemiddeld {((profile.minSpeed + profile.maxSpeed) / 2).toFixed(1)} km/u
          en {profile.avgFuelConsumptionPerHour.toFixed(1)} L/u.
        </Text>
      </View>

      <PrimaryButton
        label={isSaving ? 'Bezig met opslaan...' : editingFlight ? 'Wijzigingen opslaan' : 'Vlucht opslaan'}
        onPress={() => {
          void handleSave();
        }}
        disabled={isSaving}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  helperText: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
