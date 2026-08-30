import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import { useLanguage } from '../../i18n/translations';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { User as UserIcon, Phone, Mail, Hash, LogOut, Save, Home, DoorOpen } from 'lucide-react-native';

export const SettingsScreen = () => {
  const { user, updateProfile, logout } = useAuth();
  const { activeRoom, leaveRoom } = useRoom();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [defaultMeals, setDefaultMeals] = useState(String(user?.defaultMealsPerDay || 2));
  const [loading, setLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    setLoading(true);
    const res = await updateProfile({
      name: name.trim(),
      defaultMealsPerDay: parseFloat(defaultMeals) || 2
    });
    setLoading(false);

    if (res.success) {
      Alert.alert('Success', 'Profile and default meals updated successfully!');
    } else {
      Alert.alert('Error', res.message || 'Failed to update settings');
    }
  };

  const handleLeaveMess = () => {
    Alert.alert(
      t.leaveMess || 'Leave Mess',
      t.leaveMessConfirm || 'Are you sure you want to leave this mess? You will need an invite code to rejoin.',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.leaveMess || 'Leave Mess',
          style: 'destructive',
          onPress: async () => {
            setLeaveLoading(true);
            const res = await leaveRoom();
            setLeaveLoading(false);
            if (!res.success) {
              Alert.alert('Error', res.message || 'Failed to leave mess');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(t.logout, 'Are you sure you want to log out?', [
      { text: t.cancel, style: 'cancel' },
      { text: t.logout, style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t.profile}</Text>

        <Card style={styles.card}>
          <CustomInput
            label={t.name}
            value={name}
            onChangeText={setName}
            icon={<UserIcon size={18} color="#64748b" />}
          />

          <View style={styles.infoRow}>
            <Phone size={18} color="#64748b" style={{ marginRight: 8 }} />
            <Text style={styles.infoLabel}>{t.phone}:</Text>
            <Text style={styles.infoValue}>{user?.phone}</Text>
          </View>

          {user?.email && (
            <View style={styles.infoRow}>
              <Mail size={18} color="#64748b" style={{ marginRight: 8 }} />
              <Text style={styles.infoLabel}>{t.email}:</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          )}

          <CustomInput
            label={t.defaultMeals}
            placeholder="2"
            value={defaultMeals}
            onChangeText={setDefaultMeals}
            keyboardType="decimal-pad"
            icon={<Hash size={18} color="#64748b" />}
          />
          <Text style={styles.descText}>{t.defaultMealsPerDayDesc}</Text>

          <CustomButton
            title={t.saveSettings}
            onPress={handleSave}
            loading={loading}
            icon={<Save size={18} color="#ffffff" />}
            style={{ marginTop: 16 }}
          />
        </Card>

        {activeRoom && (
          <Card style={[styles.card, styles.messCard]}>
            <View style={styles.messHeader}>
              <Home size={20} color="#0d9488" style={{ marginRight: 8 }} />
              <Text style={styles.messTitle}>{t.activeMess}</Text>
            </View>
            <View style={styles.messInfo}>
              <Text style={styles.messName}>{activeRoom.name}</Text>
              <Text style={styles.messCode}>{t.roomCode}: {activeRoom.inviteCode || activeRoom.roomCode}</Text>
            </View>
            <CustomButton
              title={t.leaveMess}
              onPress={handleLeaveMess}
              loading={leaveLoading}
              variant="danger"
              icon={<DoorOpen size={18} color="#ffffff" />}
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

        <CustomButton
          title={t.logout}
          onPress={handleLogout}
          variant="outline"
          icon={<LogOut size={18} color="#0d9488" />}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  container: {
    padding: 16,
    paddingBottom: 30
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12
  },
  card: {
    padding: 16
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 6
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  descText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginLeft: 4
  },
  messCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fff'
  },
  messHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  messTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  messInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4
  },
  messName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  messCode: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0d9488',
    marginTop: 2
  }
});
