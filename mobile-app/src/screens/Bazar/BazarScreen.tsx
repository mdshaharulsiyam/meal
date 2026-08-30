import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRoom } from '../../context/RoomContext';
import { useLanguage } from '../../i18n/translations';
import apiClient from '../../api/client';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { CustomButton } from '../../components/CustomButton';
import { CustomInput } from '../../components/CustomInput';
import { BazarExpense } from '../../types';
import { ShoppingCart, Plus, Trash2, Calendar, DollarSign, User as UserIcon } from 'lucide-react-native';

export const BazarScreen = () => {
  const { activeRoom, activeMonth, canEdit, isManager } = useRoom();
  const { t, fNum, fCurr } = useLanguage();

  const [bazarList, setBazarList] = useState<BazarExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidByUserId, setPaidByUserId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBazar = useCallback(async () => {
    if (!activeRoom) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/bazar/${activeRoom._id}`, {
        params: { monthString: activeMonth }
      });
      if (res.data && Array.isArray(res.data.expenses)) {
        setBazarList(res.data.expenses);
      }
    } catch (err) {
      console.log('Error fetching bazar:', err);
    } finally {
      setLoading(false);
    }
  }, [activeRoom, activeMonth]);

  useEffect(() => {
    fetchBazar();
  }, [fetchBazar]);

  const handleAddBazar = async () => {
    if (!amount || !paidByUserId || !description) {
      Alert.alert('Error', 'Please fill in amount, description and select paid by user');
      return;
    }
    try {
      setSubmitting(true);
      const dateStr = `${activeMonth}-${String(new Date().getDate()).padStart(2, '0')}`;
      await apiClient.post('/bazar', {
        roomId: activeRoom?._id,
        paidByUserId,
        amount: parseFloat(amount),
        description,
        dateString: dateStr,
        monthString: activeMonth
      });
      setShowModal(false);
      setAmount('');
      setDescription('');
      await fetchBazar();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this bazar entry?', [
      { text: t.cancel, style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/bazar/${id}`);
            await fetchBazar();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete entry');
          }
        }
      }
    ]);
  };

  const totalBazarSum = bazarList.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>{t.bazar}</Text>
            <Text style={styles.totalSum}>{t.totalBazar}: {fCurr(totalBazarSum)}</Text>
          </View>

          {canEdit && (
            <CustomButton
              title={t.addExpense}
              onPress={() => {
                if (activeRoom?.members?.length) {
                  const firstUId = typeof activeRoom.members[0].userId === 'object'
                    ? activeRoom.members[0].userId._id
                    : activeRoom.members[0].userId;
                  setPaidByUserId(firstUId);
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
          bazarList.map((item) => {
            const buyerName = typeof item.paidByUserId === 'object' ? item.paidByUserId.name : 'Member';
            return (
              <Card key={item._id} style={styles.expenseCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBadge}>
                    <ShoppingCart size={18} color="#d97706" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                    <Text style={styles.itemMeta}>
                      {buyerName} • {fNum(item.dateString)}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.itemAmount}>{fCurr(item.amount)}</Text>
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

      {/* Add Expense Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.addExpense}</Text>

            <CustomInput
              label={t.description}
              placeholder="E.g., Chicken, Rice, Oil, Vegetables"
              value={description}
              onChangeText={setDescription}
            />

            <CustomInput
              label={t.amount}
              placeholder="1200"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.pickerLabel}>{t.buyer}</Text>
            <ScrollView style={styles.userPicker} nestedScrollEnabled>
              {activeRoom?.members.map((m) => {
                const uId = typeof m.userId === 'object' ? m.userId._id : m.userId;
                const name = typeof m.userId === 'object' ? m.userId.name : 'Member';
                const isSelected = paidByUserId === uId;

                return (
                  <TouchableOpacity
                    key={uId}
                    style={[styles.userOption, isSelected && styles.userOptionSelected]}
                    onPress={() => setPaidByUserId(uId)}
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
                onPress={handleAddBazar}
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
    color: '#d97706',
    marginTop: 2
  },
  expenseCard: {
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
    backgroundColor: '#fffbeb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fde68a'
  },
  itemDesc: {
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
    color: '#0d9488'
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
