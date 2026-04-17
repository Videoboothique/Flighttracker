import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { RouteMap } from '../components/RouteMap';
import { SectionHeader } from '../components/SectionHeader';
import { colors, radii, spacing } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { FlightsStackParamList } from '../navigation/AppNavigator';
import { formatDateTime, formatDistance, formatDuration, formatFuel } from '../utils/format';

type Props = NativeStackScreenProps<FlightsStackParamList, 'VluchtDetail'>;

export function FlightDetailScreen({ navigation, route }: Props) {
  const { flights, deleteFlight } = useAppContext();
  const flight = flights.find((item) => item.id === route.params.flightId);

  if (!flight) {
    return (
      <View style={styles.missingState}>
        <Text style={styles.missingTitle}>Deze vlucht is niet gevonden.</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Vlucht verwijderen', 'Weet je zeker dat je deze vlucht wilt verwijderen?', [
      { text: 'Annuleren', style: 'cancel' },
      {
        text: 'Verwijderen',
        style: 'destructive',
        onPress: () => {
          void deleteFlight(flight.id).then(() => navigation.goBack());
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader title={flight.name} subtitle={flight.places.map((place) => place.name).join(' → ')} />

      <RouteMap places={flight.places} height={300} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Routepunten</Text>
        {flight.places.map((place, index) => (
          <Text key={`${place.id}-${index}`} style={styles.placeRow}>
            {index + 1}. {place.name}
            {place.province ? `, ${place.province}` : ''}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vluchtinformatie</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Afstand</Text>
          <Text style={styles.infoValue}>{formatDistance(flight.totalDistanceKm)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Geschatte duur</Text>
          <Text style={styles.infoValue}>{formatDuration(flight.estimatedDurationHours)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Geschat verbruik</Text>
          <Text style={styles.infoValue}>{formatFuel(flight.estimatedFuelLiters)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Aangemaakt op</Text>
          <Text style={styles.infoValue}>{formatDateTime(flight.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Vlucht bewerken"
          onPress={() => navigation.navigate('VluchtBewerken', { flightId: flight.id })}
        />
        <PrimaryButton label="Vlucht verwijderen" variant="danger" onPress={handleDelete} />
      </View>
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
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  placeRow: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 23,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.textMuted,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    fontWeight: '700',
    color: colors.text,
  },
  actions: {
    gap: spacing.md,
  },
});
