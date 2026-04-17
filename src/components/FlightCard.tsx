import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing } from '../constants/theme';
import { Flight } from '../types';
import { formatDate, formatDistance, formatDuration, formatFuel } from '../utils/format';

type FlightCardProps = {
  flight: Flight;
  onPress: () => void;
};

export function FlightCard({ flight, onPress }: FlightCardProps) {
  const routeSummary = flight.places.map((place) => place.name).join(' → ');

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{flight.name}</Text>
        <Text style={styles.date}>{formatDate(flight.createdAt)}</Text>
      </View>
      <Text style={styles.route}>{routeSummary}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>{formatDistance(flight.totalDistanceKm)}</Text>
        <Text style={styles.stat}>{formatDuration(flight.estimatedDurationHours)}</Text>
        <Text style={styles.stat}>{formatFuel(flight.estimatedFuelLiters)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  date: {
    fontSize: 14,
    color: colors.textMuted,
  },
  route: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stat: {
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.pill,
    fontSize: 14,
    fontWeight: '700',
  },
});
