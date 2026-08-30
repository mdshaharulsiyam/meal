import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatChipProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
}

export const StatChip: React.FC<StatChipProps> = ({
  label,
  value,
  icon,
  color = '#0d9488',
  bgColor = '#f0fdf4'
}) => {
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)'
  },
  iconContainer: {
    marginRight: 8
  },
  textContainer: {
    flex: 1
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2
  },
  value: {
    fontSize: 16,
    fontWeight: '700'
  }
});
