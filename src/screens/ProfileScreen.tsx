import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { colors, radii, spacing } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

export function ProfileScreen() {
  const { profile, saveProfile } = useAppContext();
  const [form, setForm] = useState({
    name: profile.name,
    minSpeed: String(profile.minSpeed),
    maxSpeed: String(profile.maxSpeed),
    avgFuelConsumptionPerHour: String(profile.avgFuelConsumptionPerHour),
    setupName: profile.setupName ?? '',
    emergencyContact: profile.emergencyContact ?? '',
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    const minSpeed = Number(form.minSpeed);
    const maxSpeed = Number(form.maxSpeed);
    const avgFuelConsumptionPerHour = Number(form.avgFuelConsumptionPerHour);

    if (!form.name.trim()) {
      Alert.alert('Naam ontbreekt', 'Vul een naam in voor het profiel.');
      return;
    }

    if ([minSpeed, maxSpeed, avgFuelConsumptionPerHour].some((value) => Number.isNaN(value) || value <= 0)) {
      Alert.alert('Ongeldige waarden', 'Vul geldige snelheden en een geldig verbruik in.');
      return;
    }

    if (minSpeed > maxSpeed) {
      Alert.alert('Controleer de snelheden', 'De minimale snelheid mag niet hoger zijn dan de maximale snelheid.');
      return;
    }

    await saveProfile({
      ...profile,
      name: form.name.trim(),
      minSpeed,
      maxSpeed,
      avgFuelConsumptionPerHour,
      setupName: form.setupName.trim(),
      emergencyContact: form.emergencyContact.trim(),
    });

    Alert.alert('Profiel opgeslagen', 'Nieuwe routeberekeningen gebruiken direct deze instellingen.');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader
        title="Profiel"
        subtitle="Pas je persoonlijke instellingen aan voor betere routeberekeningen."
      />

      <View style={styles.card}>
        <FormField label="Naam" value={form.name} onChangeText={(value) => updateField('name', value)} />
        <FormField
          label="Minimale snelheid (km/u)"
          value={form.minSpeed}
          onChangeText={(value) => updateField('minSpeed', value)}
          keyboardType="numeric"
        />
        <FormField
          label="Maximale snelheid (km/u)"
          value={form.maxSpeed}
          onChangeText={(value) => updateField('maxSpeed', value)}
          keyboardType="numeric"
        />
        <FormField
          label="Gemiddeld verbruik per uur (L)"
          value={form.avgFuelConsumptionPerHour}
          onChangeText={(value) => updateField('avgFuelConsumptionPerHour', value)}
          keyboardType="numeric"
        />
        <FormField
          label="Naam van de setup"
          value={form.setupName}
          onChangeText={(value) => updateField('setupName', value)}
          placeholder="Optioneel"
        />
        <FormField
          label="Noodcontact"
          value={form.emergencyContact}
          onChangeText={(value) => updateField('emergencyContact', value)}
          placeholder="Optioneel"
        />
      </View>

      <PrimaryButton
        label="Profiel opslaan"
        onPress={() => {
          void handleSave();
        }}
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
