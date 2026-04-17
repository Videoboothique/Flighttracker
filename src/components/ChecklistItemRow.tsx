import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

type ChecklistItemRowProps = {
  label: string;
  completed: boolean;
  canDelete?: boolean;
  onToggle: () => void;
  onDelete?: () => void;
};

export function ChecklistItemRow({
  label,
  completed,
  canDelete = false,
  onToggle,
  onDelete,
}: ChecklistItemRowProps) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: completed }} onPress={onToggle} style={styles.checkboxRow}>
        <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
          {completed ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={[styles.label, completed && styles.completedLabel]}>{label}</Text>
      </Pressable>
      {canDelete && onDelete ? (
        <Pressable accessibilityRole="button" onPress={onDelete} hitSlop={10}>
          <Text style={styles.deleteText}>Verwijder</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.md,
  },
  checkboxRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  completedLabel: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
