import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoom } from '../context/RoomContext';
import { useLanguage } from '../i18n/translations';
import { LanguageToggle } from './LanguageToggle';
import { ModeBadge } from './ModeBadge';
import { Settings, Calendar, Copy, ChevronDown } from 'lucide-react-native';
import { ApiConfigModal } from './ApiConfigModal';
import { MonthPickerModal } from './MonthPickerModal';

export const Header: React.FC = () => {
  const { activeRoom, activeMonth, setActiveMonth } = useRoom();
  const { t, fNum } = useLanguage();
  const [showConfig, setShowConfig] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const copyRoomCode = () => {
    if (!activeRoom) return;
    Alert.alert(t.roomCode, `${t.roomCode}: ${activeRoom.roomCode}`);
  };

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName} numberOfLines={1}>
            {activeRoom ? activeRoom.name : t.noRoomSelected}
          </Text>
          {activeRoom && (
            <TouchableOpacity style={styles.codeBadge} onPress={copyRoomCode} activeOpacity={0.7}>
              <Text style={styles.codeText}>{t.roomCode}: {activeRoom.roomCode}</Text>
              <Copy size={12} color="#0f766e" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightActions}>
          <LanguageToggle />
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowConfig(true)}
            activeOpacity={0.7}
          >
            <Settings size={18} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {activeRoom && (
        <View style={styles.bottomRow}>
          <ModeBadge mode={activeRoom.mode} />

          <TouchableOpacity
            style={styles.monthSelector}
            onPress={() => setShowMonthPicker(true)}
            activeOpacity={0.7}
          >
            <Calendar size={14} color="#0d9488" style={{ marginRight: 4 }} />
            <Text style={styles.monthText}>{fNum(activeMonth)}</Text>
            <ChevronDown size={14} color="#0d9488" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      )}

      <ApiConfigModal visible={showConfig} onClose={() => setShowConfig(false)} />
      <MonthPickerModal
        visible={showMonthPicker}
        currentMonth={activeMonth}
        onSelect={(m) => {
          setActiveMonth(m);
          setShowMonthPicker(false);
        }}
        onClose={() => setShowMonthPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  roomInfo: {
    flex: 1,
    marginRight: 8
  },
  roomName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  codeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e'
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginLeft: 8
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  monthText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0d9488'
  }
});
