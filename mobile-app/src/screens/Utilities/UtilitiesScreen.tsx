import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRoom } from '../../context/RoomContext';
import { useLanguage } from '../../i18n/translations';
import apiClient from '../../api/client';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { CustomButton } from '../../components/CustomButton';
import { CustomInput } from '../../components/CustomInput';
import { UtilityBill } from '../../types';
import { Zap, Plus, Trash2, Users } from 'lucide-react-native';

export const UtilitiesScreen = () => {
  const { activeRoom, activeMonth, canEdit, isManager } = useRoom();
  const { t, fNum, fCurr } = useLanguage();

  const [utilityList, setUtilityList] = useState<UtilityBill[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUtilities = useCallback(async () => {
    if (!activeRoom) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/utilities/${activeRoom._id}`, {
        params: { monthString: activeMonth }
      });
      if (res.data && Array.isArray(res.data.utilities)) {
        setUtilityList(res.data.utilities);
      }
    } catch (err) {
      console.log('Error fetching utilities:', err);
    } finally {
      setLoading(false);
    }
  }, [activeRoom, activeMonth]);

  useEffect(() => {
    fetchUtilities();
  }, [fetchUtilities]);

  const handleAddUtility = async () => {
    if (!title || !amount) {
      Alert.alert('Error', 'Please fill in bill title and amount');
      return;
    }
    try {
      setSubmitting(true);
      const dateStr = `${activeMonth}-${String(new Date().getDate()).padStart(2, '0')}`;
      await apiClient.post('/utilities', {
        roomId: activeRoom?._id,
        title,
        amount: parseFloat(amount),
        dateString: dateStr,
        monthString: activeMonth
      });
      setShowModal(false);
      setTitle('');
      setAmount('');
      await fetchUtilities();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add utility');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this bill?', [
      { text: t.cancel, style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/utilities/${id}`);
            await fetchUtilities();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete utility');
          }
        }
      }
    ]);
  };

  const totalUtilitySum = utilityList.reduce((acc, curr) => acc + curr.amount, 0);
  const memberCount = activeRoom?.members?.length || 1;
  const perMemberShare = totalUtilitySum / memberCount;

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>{t.utilities}</Text>
            <Text style={styles.totalSum}>{t.totalUtilities}: {fCurr(totalUtilitySum)}</Text>
          </View>

          {canEdit && (
            <CustomButton
              title={t.addUtility}
              onPress={() => setShowModal(true)}
              icon={<Plus size={16} color="#ffffff" />}
              style={{ height: 40 }}
            />
          )}
        </View>

        {/* Equal Split Summary Banner */}
        <Card style={styles.splitBanner}>
          <View style={styles.splitRow}>
            <Users size={20} color="#9333ea" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.splitTitle}>{t.utilityShare}</Text>
              <Text style={styles.splitSub}>
                Split equally among {fNum(memberCount)} members
              </Text>
            </View>
            <Text style={styles.splitAmount}>{fCurr(perMemberShare)} / {t.member}</Text>
          </View>
        </Card>

        {loading ? (
          <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 20 }} />
        ) : (
          utilityList.map((item) => (
            <Card key={item._id} style={styles.utilityCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBadge}>
                  <Zap size={18} color="#9333ea" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.billTitle}>{item.title}</Text>
                  <Text style={styles.itemMeta}>{fNum(item.dateString)}</Text>
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
          ))
        )}
      </ScrollView>

      {/* Add Utility Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.addUtility}</Text>

            <CustomInput
              label={t.title}
              placeholder="E.g., Electricity, Gas, Internet, Maid salary"
              value={title}
              onChangeText={setTitle}
            />

            <CustomInput
              label={t.amount}
              placeholder="1500"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <View style={styles.btnRow}>
              <CustomButton
                title={t.cancel}
                variant="outline"
                onPress={() => setShowModal(false)}
                style={{ flex: 1, marginRight: 6 }}
              />
              <CustomButton
                title={t.save}
                onPress={handleAddUtility}
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
    color: '#9333ea',
    marginTop: 2
  },
  splitBanner: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
    padding: 14,
    marginBottom: 12
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  splitTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6b21a8'
  },
  splitSub: {
    fontSize: 11,
    color: '#7e22ce'
  },
  splitAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6b21a8'
  },
  utilityCard: {
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
    backgroundColor: '#faf5ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9d5ff'
  },
  billTitle: {
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
    color: '#9333ea'
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
  btnRow: {
    flexDirection: 'row',
    marginTop: 12
  }
});
