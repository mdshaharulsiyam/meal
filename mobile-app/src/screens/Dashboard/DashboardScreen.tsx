import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/translations';
import apiClient from '../../api/client';
import { MonthlySettlementSummary, RoomMode } from '../../types';
import { Card } from '../../components/Card';
import { StatChip } from '../../components/StatChip';
import { CustomButton } from '../../components/CustomButton';
import { Header } from '../../components/Header';
import {
  Utensils,
  ShoppingCart,
  Wallet,
  Zap,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  FileText,
  Lock
} from 'lucide-react-native';
import { generateAndSharePdf } from '../../utils/pdfGenerator';

export const DashboardScreen = ({ navigation }: any) => {
  const { activeRoom, activeMonth } = useRoom();
  const { user } = useAuth();
  const { t, fNum, fCurr, language } = useLanguage();

  const [summary, setSummary] = useState<MonthlySettlementSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!activeRoom) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/settlement/${activeRoom._id}/summary`, {
        params: { monthString: activeMonth }
      });
      if (res.data && res.data.data) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching settlement summary:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeRoom, activeMonth]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const myResult = summary?.memberResults?.find((m) => m.userId === user?._id);
  const isSingleMode = activeRoom?.mode === RoomMode.SINGLE_MANAGER;

  const handleExportPdf = async () => {
    if (!summary || !activeRoom) return;
    try {
      await generateAndSharePdf(summary, activeRoom, language);
    } catch (err) {
      Alert.alert('PDF Error', 'Failed to generate PDF report');
    }
  };

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSummary(); }} />}
      >
        {/* Personal Dena-Paona Net Balance Card */}
        {myResult && (
          <Card
            style={[
              styles.netCard,
              myResult.netBalance >= 0 ? styles.refundBg : styles.dueBg
            ]}
          >
            <View style={styles.netHeaderRow}>
              <Text style={styles.netTitle}>{t.myStatus}</Text>
              <View style={styles.netBadge}>
                {myResult.netBalance >= 0 ? (
                  <ArrowUpRight size={16} color="#15803d" />
                ) : (
                  <ArrowDownRight size={16} color="#b91c1c" />
                )}
                <Text style={[styles.netBadgeText, myResult.netBalance >= 0 ? styles.refundText : styles.dueText]}>
                  {myResult.netBalance >= 0 ? t.refund : t.due}
                </Text>
              </View>
            </View>

            <Text style={[styles.netAmount, myResult.netBalance >= 0 ? styles.refundText : styles.dueText]}>
              {fCurr(Math.abs(myResult.netBalance))}
            </Text>

            <View style={styles.netDetailRow}>
              <View style={styles.netDetailItem}>
                <Text style={styles.netDetailLabel}>{t.personalMeals}</Text>
                <Text style={styles.netDetailVal}>{fNum(myResult.totalMeals)}</Text>
              </View>
              <View style={styles.netDetailItem}>
                <Text style={styles.netDetailLabel}>{t.totalPersonalCost}</Text>
                <Text style={styles.netDetailVal}>{fCurr(myResult.totalPersonalCost)}</Text>
              </View>
              <View style={styles.netDetailItem}>
                <Text style={styles.netDetailLabel}>{isSingleMode ? t.personalJoma : t.personalBazar}</Text>
                <Text style={styles.netDetailVal}>{fCurr(isSingleMode ? myResult.personalJoma : myResult.personalBazarSpent)}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Room Financial Metrics Chips */}
        <Text style={styles.sectionHeader}>{t.dashboard}</Text>
        <View style={styles.chipGrid}>
          <View style={styles.chipRow}>
            <StatChip
              label={t.mealRate}
              value={fCurr(summary?.mealRate || 0)}
              icon={<TrendingUp size={20} color="#0d9488" />}
              color="#0d9488"
              bgColor="#f0fdf4"
            />
            <StatChip
              label={t.totalMeals}
              value={fNum(summary?.totalRoomMeals || 0)}
              icon={<Utensils size={20} color="#0284c7" />}
              color="#0284c7"
              bgColor="#f0f9ff"
            />
          </View>

          <View style={styles.chipRow}>
            <StatChip
              label={t.totalBazar}
              value={fCurr(summary?.totalBazarExpense || 0)}
              icon={<ShoppingCart size={20} color="#d97706" />}
              color="#d97706"
              bgColor="#fffbeb"
            />
            {isSingleMode ? (
              <StatChip
                label={t.totalJoma}
                value={fCurr(summary?.totalJomaCollected || 0)}
                icon={<Wallet size={20} color="#16a34a" />}
                color="#16a34a"
                bgColor="#f0fdf4"
              />
            ) : (
              <StatChip
                label={t.totalUtilities}
                value={fCurr(summary?.totalUtilityBills || 0)}
                icon={<Zap size={20} color="#9333ea" />}
                color="#9333ea"
                bgColor="#faf5ff"
              />
            )}
          </View>
        </View>

        {/* Quick PDF Report Trigger */}
        <CustomButton
          title={t.downloadPdf}
          onPress={handleExportPdf}
          variant="outline"
          icon={<FileText size={18} color="#0d9488" />}
          style={{ marginVertical: 12 }}
        />

        {/* Members Ledger Breakdown Table */}
        <Text style={styles.sectionHeader}>{t.settlement}</Text>
        {summary?.memberResults.map((m) => {
          const isRefund = m.netBalance >= 0;
          return (
            <Card key={m.userId} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.userName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.memberName}>{m.userName}</Text>
                  <Text style={styles.memberMeals}>{fNum(m.totalMeals)} {t.meals}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.memberNet, isRefund ? styles.refundText : styles.dueText]}>
                    {isRefund ? `+${fCurr(m.netBalance)}` : fCurr(m.netBalance)}
                  </Text>
                  <Text style={styles.memberStatusLabel}>{isRefund ? t.refund : t.due}</Text>
                </View>
              </View>
            </Card>
          );
        })}
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
  netCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 16
  },
  refundBg: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0'
  },
  dueBg: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca'
  },
  netHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  netTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569'
  },
  netBadge: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  netBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 2
  },
  netAmount: {
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 8
  },
  refundText: {
    color: '#15803d'
  },
  dueText: {
    color: '#b91c1c'
  },
  netDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 10,
    marginTop: 6
  },
  netDetailItem: {
    alignItems: 'center'
  },
  netDetailLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600'
  },
  netDetailVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 12,
    marginBottom: 8
  },
  chipGrid: {
    marginVertical: 4
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  memberCard: {
    padding: 12,
    marginVertical: 4
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#99f6e4'
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f766e'
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  memberMeals: {
    fontSize: 12,
    color: '#64748b'
  },
  memberNet: {
    fontSize: 15,
    fontWeight: '800'
  },
  memberStatusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b'
  }
});
