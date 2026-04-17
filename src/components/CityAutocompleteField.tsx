import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';
import { searchDutchCities } from '../services/geocoding';
import { Place } from '../types';

type CityAutocompleteFieldProps = {
  label: string;
  value: Place | null;
  onSelect: (place: Place | null) => void;
  placeholder?: string;
};

export function CityAutocompleteField({
  label,
  value,
  onSelect,
  placeholder,
}: CityAutocompleteFieldProps) {
  const [query, setQuery] = useState(value?.name ?? '');
  const [results, setResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setQuery(value?.name ?? '');
  }, [value?.name]);

  useEffect(() => {
    if (!showResults) {
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError('');
      return;
    }

    const timeoutId = setTimeout(() => {
      const load = async () => {
        try {
          setIsLoading(true);
          setError('');
          const nextResults = await searchDutchCities(trimmed);
          setResults(nextResults);
          if (nextResults.length === 0) {
            setError('Geen Nederlandse plaats gevonden. Probeer een andere naam.');
          }
        } catch {
          setResults([]);
          setError('Zoeken lukt nu even niet. Probeer het opnieuw.');
        } finally {
          setIsLoading(false);
        }
      };

      void load();
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query, showResults]);

  const handleChange = (nextValue: string) => {
    setQuery(nextValue);
    setShowResults(true);
    if (nextValue.trim().length === 0 && value) {
      onSelect(null);
    }
  };

  const handleSelect = (place: Place) => {
    onSelect(place);
    setQuery(place.name);
    setResults([]);
    setError('');
    setShowResults(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={query}
        onChangeText={handleChange}
        onFocus={() => setShowResults(true)}
        placeholder={placeholder ?? 'Zoek een plaats in Nederland'}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCapitalize="words"
      />
      {isLoading ? (
        <View style={styles.feedbackRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.feedbackText}>Plaatsen worden gezocht...</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {showResults && results.length > 0 ? (
        <View style={styles.results}>
          {results.map((item) => (
            <Pressable key={item.id} onPress={() => handleSelect(item)} style={styles.resultItem}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultMeta}>{item.province ?? 'Nederland'}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {value ? (
        <Pressable onPress={() => handleSelect({ ...value })} style={styles.selectedPill}>
          <Text style={styles.selectedText}>
            Geselecteerd: {value.name}
            {value.province ? `, ${value.province}` : ''}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  feedbackText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
  },
  results: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  resultItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 4,
  },
  resultName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
  },
  resultMeta: {
    fontSize: 14,
    color: colors.textMuted,
  },
  selectedPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  selectedText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
