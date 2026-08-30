import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoomMode } from '../types';
import { useLanguage } from '../i18n/translations';
import { UserCheck, Users } from 'lucide-react-native';

interface ModeBadgeProps {
  mode?: RoomMode;
}

export const ModeBadge: React.FC<ModeBadgeProps> = ({ mode }) => {
  const { t } = useLanguage();
  const isSingle = mode === RoomMode.SINGLE_MANAGER;

  return (
    <View style={[styles.badge, isSingle ? styles.singleBadge : styles.collabBadge]}>
      {isSingle ? (
        <UserCheck size={12} color="#0369a1" style={{ marginRight: 4 }} />
      ) : (
        <Users size={12} color="#7c2d12" style={{ marginRight: 4 }} />
      )}
      <Text style={[styles.text, isSingle ? styles.singleText : styles.collabText]}>
        {isSingle ? t.singleManagerMode : t.collaborativeMode}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  singleBadge: {
    backgroundColor: '#e0f2fe'
  },
  collabBadge: {
    backgroundColor: '#ffedd5'
  },
  text: {
    fontSize: 11,
    fontWeight: '700'
  },
  singleText: {
    color: '#0369a1'
  },
  collabText: {
    color: '#9a3412'
  }
});
