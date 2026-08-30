import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CustomButton } from './CustomButton';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useLanguage } from '../i18n/translations';

interface MonthPickerModalProps {
  visible: boolean;
  currentMonth: string; // YYYY-MM
  onSelect: (month: string) => void;
  onClose: () => void;
}

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  currentMonth,
  onSelect,
  onClose
}) => {
  const { fNum } = useLanguage();
  const [year, setYear] = useState<number>(() => {
    const parts = currentMonth.split('-');
    return parseInt(parts[0], 10) || new Date().getFullYear();
  });

  const months = [
    { label: 'Jan (০১)', val: '01' },
    { label: 'Feb (০২)', val: '02' },
    { label: 'Mar (০৩)', val: '03' },
    { label: 'Apr (০৪)', val: '04' },
    { label: 'May (০৫)', val: '05' },
    { label: 'Jun (০৬)', val: '06' },
    { label: 'Jul (০৭)', val: '07' },
    { label: 'Aug (০৮)', val: '08' },
    { label: 'Sep (০৯)', val: '09' },
    { label: 'Oct (১০)', val: '10' },
    { label: 'Nov (১১)', val: '11' },
    { label: 'Dec (১২)', val: '12' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Calendar size={20} color="#0d9488" style={{ marginRight: 8 }} />
            <Text style={styles.title}>Select Month</Text>
          </View>

          <View style={styles.yearRow}>
            <TouchableOpacity onPress={() => setYear((y) => y - 1)} style={styles.arrowBtn}>
              <ChevronLeft size={20} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.yearText}>{fNum(year)}</Text>
            <TouchableOpacity onPress={() => setYear((y) => y + 1)} style={styles.arrowBtn}>
              <ChevronRight size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {months.map((m) => {
              const fullMonth = `${year}-${m.val}`;
              const isSelected = currentMonth === fullMonth;
              return (
                <TouchableOpacity
                  key={m.val}
                  style={[styles.monthItem, isSelected && styles.monthSelected]}
                  onPress={() => onSelect(fullMonth)}
                >
                  <Text style={[styles.monthLabel, isSelected && styles.monthLabelSelected]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <CustomButton title="Close" variant="outline" onPress={onClose} style={{ marginTop: 16 }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 20
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16
  },
  arrowBtn: {
    padding: 4
  },
  yearText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f766e'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  monthItem: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    marginVertical: 4
  },
  monthSelected: {
    backgroundColor: '#0d9488'
  },
  monthLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  monthLabelSelected: {
    color: '#ffffff'
  }
});
