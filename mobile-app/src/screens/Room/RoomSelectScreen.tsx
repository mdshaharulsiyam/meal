import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import { useLanguage } from '../../i18n/translations';
import { RoomMode } from '../../types';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { LanguageToggle } from '../../components/LanguageToggle';
import { UserCheck, Users, PlusCircle, LogIn, Sparkles, LogOut } from 'lucide-react-native';

export const RoomSelectScreen = ({ navigation }: any) => {
  const { logout } = useAuth();
  const { createRoom, joinRoom } = useRoom();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  
  // Create Room Form
  const [roomName, setRoomName] = useState('');
  const [selectedMode, setSelectedMode] = useState<RoomMode>(RoomMode.SINGLE_MANAGER);
  
  // Join Room Form
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }
    setError('');
    setLoading(true);
    const res = await createRoom(roomName.trim(), selectedMode);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Failed to create room');
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Please enter room code');
      return;
    }
    setError('');
    setLoading(true);
    const res = await joinRoom(roomCode.trim().toUpperCase());
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Failed to join room');
    }
  };

  const handleLogout = () => {
    Alert.alert(t.logout, 'Are you sure you want to log out?', [
      { text: t.cancel, style: 'cancel' },
      { text: t.logout, style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <LanguageToggle />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <LogOut size={16} color="#ef4444" style={{ marginRight: 4 }} />
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={styles.badge}>
          <Sparkles size={24} color="#0d9488" />
        </View>
        <Text style={styles.title}>{t.selectOrCreateRoom}</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'join' && styles.activeTab]}
          onPress={() => { setActiveTab('join'); setError(''); }}
        >
          <LogIn size={16} color={activeTab === 'join' ? '#0d9488' : '#64748b'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'join' && styles.activeTabText]}>
            {t.joinRoom}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => { setActiveTab('create'); setError(''); }}
        >
          <PlusCircle size={16} color={activeTab === 'create' ? '#0d9488' : '#64748b'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            {t.createRoom}
          </Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {activeTab === 'create' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.createRoom}</Text>

          <CustomInput
            label={t.roomName}
            placeholder="E.g., Green Valley Hostel Room 402"
            value={roomName}
            onChangeText={setRoomName}
          />

          <Text style={styles.sectionLabel}>{t.selectMode}</Text>

          <TouchableOpacity
            style={[styles.modeCard, selectedMode === RoomMode.SINGLE_MANAGER && styles.modeCardSelected]}
            onPress={() => setSelectedMode(RoomMode.SINGLE_MANAGER)}
          >
            <View style={styles.modeIconHeader}>
              <UserCheck size={20} color="#0369a1" />
              <Text style={styles.modeTitle}>{t.singleManagerMode}</Text>
            </View>
            <Text style={styles.modeDesc}>{t.singleManagerDesc}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, selectedMode === RoomMode.COLLABORATIVE && styles.modeCardSelected]}
            onPress={() => setSelectedMode(RoomMode.COLLABORATIVE)}
          >
            <View style={styles.modeIconHeader}>
              <Users size={20} color="#9a3412" />
              <Text style={styles.modeTitle}>{t.collaborativeMode}</Text>
            </View>
            <Text style={styles.modeDesc}>{t.collaborativeDesc}</Text>
          </TouchableOpacity>

          <CustomButton
            title={t.createRoom}
            onPress={handleCreateRoom}
            loading={loading}
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.joinRoom}</Text>
          <Text style={styles.descText}>Ask your Mess Manager for the 6-character room code to join.</Text>

          <CustomInput
            label={t.roomCode}
            placeholder="E.g., A1B2C3"
            value={roomCode}
            onChangeText={setRoomCode}
            autoCapitalize="characters"
            maxLength={10}
          />

          <CustomButton
            title={t.joinRoom}
            onPress={handleJoinRoom}
            loading={loading}
            style={{ marginTop: 16 }}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
    justifyContent: 'center'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444'
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b'
  },
  activeTabText: {
    color: '#0d9488',
    fontWeight: '800'
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12
  },
  descText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 8
  },
  modeCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10
  },
  modeCardSelected: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdf4'
  },
  modeIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginLeft: 8
  },
  modeDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  }
});
