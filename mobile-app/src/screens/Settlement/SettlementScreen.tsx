import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/translations';
import apiClient from '../../api/client';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { CustomButton } from '../../components/CustomButton';
import { MonthlySettlementSummary, MemberRole, RoomMode } from '../../types';
import { FileText, Lock, Shield, UserCheck, Users, CheckCircle } from 'lucide-react-native';
import { generateAndSharePdf } from '../../utils/pdfGenerator';

export const SettlementScreen = () => {
  const { activeRoom, activeMonth, isManager, updateMemberRole, fetchRoomDetails } = useRoom();
  const { user } = useAuth();
  const { t, fNum, fCurr, language } = useLanguage();

  const [summary, setSummary] = useState<MonthlySettlementSummary | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locking, setLocking] = useState(false);

  const fetchSettlement = useCallback(async () => {
    if (!activeRoom) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/settlement/${activeRoom._id}/summary`, {
        params: { monthString: activeMonth }
      });
      if (res.data) {
        setIsLocked(res.data.isLocked || false);
        setSummary(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching settlement:', err);
    } finally {
      setLoading(false);
    }
  }, [activeRoom, activeMonth]);

  useEffect(() => {
    fetchSettlement();
  }, [fetchSettlement]);

  const handleLockMonth = () => {
    Alert.alert(
      t.closeMonth,
      'Are you sure you want to close and permanently lock this month? No further edits will be allowed.',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: 'Lock Month',
          style: 'destructive',
          onPress: async () => {
            try {
              setLocking(true);
              const res = await apiClient.post('/settlement/close-month', {
                roomId: activeRoom?._id,
                monthString: activeMonth
              });
              Alert.alert('Success', res.data?.message || 'Month locked successfully');
              await fetchSettlement();
              await fetchRoomDetails();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to lock month');
            } finally {
              setLocking(false);
            }
          }
        }
      ]
    );
  };

  const handleExportPdf = async () => {
    if (!summary || !activeRoom) return;
    try {
      await generateAndSharePdf(summary, activeRoom, language);
    } catch (err) {
      Alert.alert('Error', 'Failed to generate PDF report');
    }
  };

  const handleRoleToggle = async (targetUserId: string, currentRole: MemberRole) => {
    const nextRole = currentRole === MemberRole.DELEGATED_EDITOR ? MemberRole.MEMBER : MemberRole.DELEGATED_EDITOR;
    const res = await updateMemberRole(targetUserId, nextRole);
    if (!res.success) {
      Alert.alert('Error', res.message || 'Failed to update role');
    }
  };

  const isSingleMode = activeRoom?.mode === RoomMode.SINGLE_MANAGER;

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Lock Status Banner */}
        <View style={[styles.statusBanner, isLocked ? styles.lockedBg : styles.activeBg]}>
          {isLocked ? <Lock size={20} color="#b91c1c" /> : <CheckCircle size={20} color="#15803d" />}
          <Text style={[styles.statusText, isLocked ? styles.lockedText : styles.activeText]}>
            {isLocked ? `${t.monthLocked} (${activeMonth})` : `Active Month: ${activeMonth}`}
          </Text>
        </View>

        {/* Export & Lock Action Buttons */}
        <View style={styles.actionRow}>
          <CustomButton
            title={t.downloadPdf}
            onPress={handleExportPdf}
            variant="outline"
            icon={<FileText size={18} color="#0d9488" />}
            style={{ flex: 1, marginRight: 6 }}
          />

          {isManager && !isLocked && (
            <CustomButton
              title={t.closeMonth}
              onPress={handleLockMonth}
              variant="danger"
              loading={locking}
              icon={<Lock size={18} color="#ffffff" />}
              style={{ flex: 1, marginLeft: 6 }}
            />
          )}
        </View>

        {/* Detailed Member Settlement Matrix */}
        <Text style={styles.sectionHeader}>{t.denaPaona}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 20 }} />
        ) : (
          summary?.memberResults.map((m) => {
            const isRefund = m.netBalance >= 0;
            return (
              <Card key={m.userId} style={styles.matrixCard}>
                <View style={styles.matrixHeader}>
                  <Text style={styles.memberName}>{m.userName}</Text>
                  <View style={[styles.balanceBadge, isRefund ? styles.refundBadge : styles.dueBadge]}>
                    <Text style={[styles.balanceText, isRefund ? styles.refundText : styles.dueText]}>
                      {isRefund ? `+${fCurr(m.netBalance)} (${t.refund})` : `${fCurr(m.netBalance)} (${t.due})`}
                    </Text>
                  </View>
                </View>

                <View style={styles.matrixGrid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>{t.meals}</Text>
                    <Text style={styles.gridVal}>{fNum(m.totalMeals)}</Text>
                  </View>

                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>{t.personalMealCost}</Text>
                    <Text style={styles.gridVal}>{fCurr(m.personalMealCost)}</Text>
                  </View>

                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>{t.utilityShare}</Text>
                    <Text style={styles.gridVal}>{fCurr(m.personalUtilityShare)}</Text>
                  </View>

                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>{t.totalPersonalCost}</Text>
                    <Text style={[styles.gridVal, { color: '#0d9488', fontWeight: '800' }]}>{fCurr(m.totalPersonalCost)}</Text>
                  </View>

                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>{isSingleMode ? t.personalJoma : t.personalBazar}</Text>
                    <Text style={styles.gridVal}>{fCurr(isSingleMode ? m.personalJoma : m.personalBazarSpent)}</Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}

        {/* Manager Member Role Management Section */}
        {isManager && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionHeader}>Member Role & Permissions</Text>
            <Card style={{ padding: 14 }}>
              {activeRoom?.members.map((m) => {
                const uId = typeof m.userId === 'object' ? m.userId._id : m.userId;
                const name = typeof m.userId === 'object' ? m.userId.name : 'Member';
                const isMe = uId === user?._id;

                return (
                  <View key={uId} style={styles.roleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roleName}>{name} {isMe ? '(You)' : ''}</Text>
                      <Text style={styles.roleBadge}>{m.role}</Text>
                    </View>

                    {!isMe && m.role !== MemberRole.MANAGER && (
                      <TouchableOpacity
                        style={[styles.roleBtn, m.role === MemberRole.DELEGATED_EDITOR && styles.roleBtnActive]}
                        onPress={() => handleRoleToggle(uId, m.role)}
                      >
                        <Shield size={14} color={m.role === MemberRole.DELEGATED_EDITOR ? '#ffffff' : '#0d9488'} style={{ marginRight: 4 }} />
                        <Text style={[styles.roleBtnText, m.role === MemberRole.DELEGATED_EDITOR && styles.roleBtnTextActive]}>
                          {m.role === MemberRole.DELEGATED_EDITOR ? 'Revoke Edit' : 'Grant Edit Access'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </Card>
          </View>
        )}
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12
  },
  activeBg: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  lockedBg: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8
  },
  activeText: {
    color: '#15803d'
  },
  lockedText: {
    color: '#b91c1c'
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 14
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10
  },
  matrixCard: {
    padding: 16,
    marginVertical: 6
  },
  matrixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 10
  },
  memberName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  balanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  refundBadge: {
    backgroundColor: '#f0fdf4'
  },
  dueBadge: {
    backgroundColor: '#fef2f2'
  },
  balanceText: {
    fontSize: 13,
    fontWeight: '800'
  },
  refundText: {
    color: '#15803d'
  },
  dueText: {
    color: '#b91c1c'
  },
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
    marginVertical: 4
  },
  gridLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600'
  },
  gridVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  roleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  roleBadge: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0d9488',
    backgroundColor: 'transparent'
  },
  roleBtnActive: {
    backgroundColor: '#0d9488'
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0d9488'
  },
  roleBtnTextActive: {
    color: '#ffffff'
  }
});
