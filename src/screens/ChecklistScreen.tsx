import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChecklistItemRow } from '../components/ChecklistItemRow';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { colors, radii, spacing } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

export function ChecklistScreen() {
  const { checklistItems, toggleChecklistItem, addChecklistItem, deleteChecklistItem, resetChecklist } =
    useAppContext();
  const [newItem, setNewItem] = useState('');

  const progress = useMemo(() => {
    const completed = checklistItems.filter((item) => item.completed).length;
    return `${completed} van ${checklistItems.length} afgerond`;
  }, [checklistItems]);

  const defaultItems = checklistItems.filter((item) => item.isDefault);
  const customItems = checklistItems.filter((item) => !item.isDefault);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader
        title="Checklist"
        subtitle="Werk rustig je voorbereiding af voordat je vertrekt."
      />

      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>{progress}</Text>
        <PrimaryButton label="Reset voor nieuwe vlucht" variant="secondary" onPress={() => void resetChecklist()} />
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Standaard</Text>
        {defaultItems.map((item) => (
          <ChecklistItemRow
            key={item.id}
            label={item.label}
            completed={item.completed}
            onToggle={() => void toggleChecklistItem(item.id)}
          />
        ))}
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Eigen items</Text>
        {customItems.length === 0 ? (
          <View style={styles.emptyCustomState}>
            <Text style={styles.emptyCustomText}>Nog geen extra checklistpunten toegevoegd.</Text>
          </View>
        ) : (
          customItems.map((item) => (
            <ChecklistItemRow
              key={item.id}
              label={item.label}
              completed={item.completed}
              canDelete
              onToggle={() => void toggleChecklistItem(item.id)}
              onDelete={() => void deleteChecklistItem(item.id)}
            />
          ))
        )}
      </View>

      <View style={styles.addCard}>
        <FormField
          label="Nieuw checklistitem"
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Bijvoorbeeld water mee"
        />
        <PrimaryButton
          label="Item toevoegen"
          onPress={() => {
            void addChecklistItem(newItem);
            setNewItem('');
          }}
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
    gap: spacing.lg,
    paddingBottom: 120,
  },
  progressCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  progressTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  group: {
    gap: spacing.md,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  emptyCustomState: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  emptyCustomText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  addCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
