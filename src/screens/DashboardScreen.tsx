import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RootTabParamList } from '../navigation/AppNavigator';
import { colors, spacing } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { formatDate, formatDistance, formatDuration, formatFuel } from '../utils/format';

type Props = BottomTabScreenProps<RootTabParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { flights, profile } = useAppContext();

  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearlyFlights = flights.filter(
      (flight) => new Date(flight.createdAt).getFullYear() === currentYear,
    );
    const totalDistance = yearlyFlights.reduce((sum, flight) => sum + flight.totalDistanceKm, 0);
    const totalDuration = yearlyFlights.reduce((sum, flight) => sum + flight.estimatedDurationHours, 0);
    const totalFuel = yearlyFlights.reduce((sum, flight) => sum + flight.estimatedFuelLiters, 0);
    const averageFuel = yearlyFlights.length ? totalFuel / yearlyFlights.length : 0;
    const averageDuration = yearlyFlights.length ? totalDuration / yearlyFlights.length : 0;

    return {
      yearlyFlights,
      totalDistance,
      totalDuration,
      averageFuel,
      averageDuration,
      lastFlight: flights[0],
    };
  }, [flights]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader
        title={`Hallo ${profile.name}`}
        subtitle="Klaar om je volgende vlucht te plannen?"
      />

      <View style={styles.statsGrid}>
        <StatCard label="Vluchten dit jaar" value={`${stats.yearlyFlights.length}`} />
        <StatCard label="Totale afstand" value={formatDistance(stats.totalDistance)} />
        <StatCard label="Totale duur" value={formatDuration(stats.totalDuration)} />
        <StatCard label="Gemiddeld verbruik" value={formatFuel(stats.averageFuel)} />
        <StatCard label="Gemiddelde duur" value={formatDuration(stats.averageDuration)} />
        <StatCard
          label="Laatste vlucht"
          value={stats.lastFlight ? stats.lastFlight.name : 'Nog geen'}
          helper={stats.lastFlight ? formatDate(stats.lastFlight.createdAt) : 'Maak je eerste vlucht'}
        />
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionLabel}>Snel naar</Text>
        <PrimaryButton
          label="Nieuwe vlucht"
          onPress={() => navigation.navigate('MijnVluchten', { screen: 'VluchtAanmaken' })}
        />
        <PrimaryButton
          label="Checklist openen"
          variant="secondary"
          onPress={() => navigation.navigate('Checklist')}
        />
        <PrimaryButton
          label="Profiel aanpassen"
          variant="secondary"
          onPress={() => navigation.navigate('Profiel')}
        />
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
    gap: spacing.xl,
    paddingBottom: 120,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickActions: {
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
});
