import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRoom } from '../../context/RoomContext';
import { useLanguage } from '../../i18n/translations';
import apiClient from '../../api/client';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { CustomButton } from '../../components/CustomButton';
import { CustomInput } from '../../components/CustomInput';
import { JomaDeposit, RoomMode } from '../../types';
import { Wallet, Plus, Trash2, Info } from 'lucide-react-native';

export const JomaScreen = () => {
  const { activeRoom, activeMonth, isManager } = useRoom();
  const { t, fNum, fCurr } = useLanguage();

  const [jomaList, setJomaList] = useState<JomaDeposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchJoma = useCallback(async () => {
    if (!activeRoom || activeRoom.mode === RoomMode.COLLABORATIVE) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/joma/${activeRoom._id}`, {
        params: { monthString: activeMonth }
      });
      if (res.data && Array.isArray(res.data.deposits)) {
        setJomaList(res.data.deposits);
      }
    } catch (err) {
      console.log('Error fetching joma:', err);
    } finally {
      setLoading(false);
    }
  }, [activeRoom, activeMonth]);

  useEffect(() => {
    fetchJoma();
  }, [fetchJoma]);

  const handleAddJoma = async () => {
    if (!amount || !targetUserId) {
      Alert.alert('Error', 'Please enter amount and select user');
      return;
    }
    try {
      setSubmitting(true);
      const dateStr = `${activeMonth}-${String(new Date().getDate()).padStart(2, '0')}`;
      await apiClient.post('/joma', {
        roomId: activeRoom?._id,
        userId: targetUserId,
        amount: parseFloat(amount),
        note,
        dateString: dateStr,
        monthString: activeMonth
      });
      setShowModal(false);
      setAmount('');
      setNote('');
      await fetchJoma();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add deposit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this deposit?', [
      { text: t.cancel, style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/joma/${id}`);
            await fetchJoma();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete deposit');
          }
        }
      }
    ]);
  };

  if (activeRoom?.mode === RoomMode.COLLABORATIVE) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.disabledContainer}>
          <View style={styles.infoBadge}>
            <Info size={32} color="#0369a1" />
          </View>
          <Text style={styles.disabledTitle}>{t.collaborativeMode}</Text>
          <Text style={styles.disabledDesc}>
            {t.singleManagerDesc} Joma deposits are excluded in Collaborative Mode.
          </Text>
        </View>
      </View>
    );
  }

  const totalJomaSum = jomaList.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>{t.joma}</Text>
            <Text style={styles.totalSum}>{t.totalJoma}: {fCurr(totalJomaSum)}</Text>
          </View>

          {isManager && (
            <CustomButton
              title={t.addDeposit}
              onPress={() => {
                if (activeRoom?.members?.length) {
                  const firstUId = typeof activeRoom.members[0].userId === 'object'
                    ? activeRoom.members[0].userId._id
                    : activeRoom.members[0].userId;
                  setTargetUserId(firstUId);
                }
                setShowModal(true);
              }}
              icon={<Plus size={16} color="#ffffff" />}
              style={{ height: 40 }}
            />
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 20 }} />
        ) : (
          jomaList.map((item) => {
            const memberName = typeof item.userId === 'object' ? item.userId.name : 'Member';
            return (
              <Card key={item._id} style={styles.depositCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBadge}>
                    <Wallet size={18} color="#16a34a" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.memberName}>{memberName}</Text>
                    <Text style={styles.itemMeta}>
                      {item.note || t.joma} • {fNum(item.dateString)}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.itemAmount}>+{fCurr(item.amount)}</Text>
                    {isManager && (
                      <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ marginTop: 4 }}>
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Add Deposit Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.addDeposit}</Text>

            <CustomInput
              label={t.amount}
              placeholder="3000"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <CustomInput
              label={t.note}
              placeholder="bKash advance / Cash"
              value={note}
              onChangeText={setNote}
            />

            <Text style={styles.pickerLabel}>Member</Text>
            <ScrollView style={styles.userPicker} nestedScrollEnabled>
              {activeRoom?.members.map((m) => {
                const uId = typeof m.userId === 'object' ? m.userId._id : m.userId;
                const name = typeof m.userId === 'object' ? m.userId.name : 'Member';
                const isSelected = targetUserId === uId;

                return (
                  <TouchableOpacity
                    key={uId}
                    style={[styles.userOption, isSelected && styles.userOptionSelected]}
                    onPress={() => setTargetUserId(uId)}
                  >
                    <Text style={[styles.userOptionText, isSelected && styles.userOptionTextSelected]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.btnRow}>
              <CustomButton
                title={t.cancel}
                variant="outline"
                onPress={() => setShowModal(false)}
                style={{ flex: 1, marginRight: 6 }}
              />
              <CustomButton
                title={t.save}
                onPress={handleAddJoma}
                loading={submitting}
                style={{ flex: 1, marginLeft: 6 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a'
  },
  totalSum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16a34a',
    marginTop: 2
  },
  depositCard: {
    padding: 14,
    marginVertical: 4
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16a34a'
  },
  disabledContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  infoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  disabledTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6
  },
  disabledDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    marginBottom: 6
  },
  userPicker: {
    maxHeight: 120,
    marginBottom: 12
  },
  userOption: {
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    marginVertical: 2
  },
  userOptionSelected: {
    backgroundColor: '#0d9488'
  },
  userOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155'
  },
  userOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '800'
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 12
  }
});
