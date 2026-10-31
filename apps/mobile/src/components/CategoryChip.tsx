import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export interface CategoryChipProps {
  id: string;
  name: string;
  tamilName?: string;
  isSelected?: boolean;
  onPress: (id: string) => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  id,
  name,
  tamilName,
  isSelected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isSelected && styles.textSelected]}>
        {tamilName || name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  textSelected: {
    color: '#FFFFFF',
  },
});
