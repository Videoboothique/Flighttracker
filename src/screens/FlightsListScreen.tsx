import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { FlightCard } from '../components/FlightCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { colors, spacing } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { FlightsStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<FlightsStackParamList, 'VluchtenLijst'>;

export function FlightsListScreen({ navigation }: Props) {
  const { flights } = useAppContext();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader
        title="Mijn vluchten"
        subtitle="Bewaar routes, bekijk schattingen en open snel je volgende plan."
      />
      <PrimaryButton label="Vlucht maken" onPress={() => navigation.navigate('VluchtAanmaken')} />

      {flights.length === 0 ? (
        <EmptyState
          title="Nog geen vluchten"
          description="Maak je eerste route en begin met het bijhouden van je vluchten."
          actionLabel="Vlucht maken"
          onAction={() => navigation.navigate('VluchtAanmaken')}
        />
      ) : (
        <View style={styles.list}>
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onPress={() => navigation.navigate('VluchtDetail', { flightId: flight.id })}
            />
          ))}
        </View>
      )}
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
  list: {
    gap: spacing.md,
  },
});
