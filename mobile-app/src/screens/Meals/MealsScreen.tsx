import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRoom } from '../../context/RoomContext';
import { useLanguage } from '../../i18n/translations';
import apiClient from '../../api/client';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { CustomButton } from '../../components/CustomButton';
import { DailyMeal } from '../../types';
import {
  Utensils,
  Minus,
  Plus,
  Save,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check
} from 'lucide-react-native';

const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
};

const WEEKDAY_NAMES = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  bn: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি']
};

const FULL_WEEKDAY_NAMES = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  bn: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার']
};

export const MealsScreen = () => {
  const { activeRoom, activeMonth, setActiveMonth, canEdit } = useRoom();
  const { t, fNum, language } = useLanguage();

  // Parse active year & month (YYYY-MM)
  const [yearNum, monthNum] = useMemo(() => {
    const parts = (activeMonth || '').split('-');
    const y = parseInt(parts[0], 10) || new Date().getFullYear();
    const m = parseInt(parts[1], 10) || (new Date().getMonth() + 1);
    return [y, m];
  }, [activeMonth]);

  // Selected date state
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date();
    if (today.getFullYear() === yearNum && today.getMonth() + 1 === monthNum) {
      return today.getDate();
    }
    return 1;
  });

  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week'>('month');
  const [dailyMeals, setDailyMeals] = useState<DailyMeal[]>([]);
  const [mealInputs, setMealInputs] = useState<{ [userId: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Total days in active month
  const totalDaysInMonth = useMemo(() => {
    return new Date(yearNum, monthNum, 0).getDate();
  }, [yearNum, monthNum]);

  // Ensure selected day is clamped within valid month days
  useEffect(() => {
    if (selectedDay > totalDaysInMonth) {
      setSelectedDay(totalDaysInMonth);
    }
  }, [totalDaysInMonth, selectedDay]);

  const formattedDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  const fetchMealsForDate = useCallback(async () => {
    if (!activeRoom) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/meals/${activeRoom._id}`, {
        params: { dateString: formattedDate }
      });
      if (res.data && Array.isArray(res.data.meals)) {
        setDailyMeals(res.data.meals);
        const map: { [uId: string]: number } = {};
        activeRoom.members.forEach((m) => {
          const uId = typeof m.userId === 'object' ? m.userId._id : m.userId;
          const found = res.data.meals.find((meal: DailyMeal) => meal.userId === uId);
          map[uId] = found ? found.totalMeals : (m.defaultMeals ?? 2);
        });
        setMealInputs(map);
      }
    } catch (err) {
      console.log('Error fetching meals:', err);
    } finally {
      setLoading(false);
    }
  }, [activeRoom, formattedDate]);

  useEffect(() => {
    fetchMealsForDate();
  }, [fetchMealsForDate]);

  const handleMealChange = (userId: string, delta: number) => {
    if (!canEdit) return;
    setMealInputs((prev) => {
      const curr = prev[userId] ?? 2;
      const nextVal = Math.max(0, Math.round((curr + delta) * 10) / 10);
      return { ...prev, [userId]: nextVal };
    });
  };

  const handleSetExactMeal = (userId: string, value: number) => {
    if (!canEdit) return;
    setMealInputs((prev) => ({ ...prev, [userId]: value }));
  };

  const handleSaveMeals = async () => {
    if (!activeRoom) return;
    try {
      setSaving(true);
      const updates = Object.keys(mealInputs).map((uId) => ({
        userId: uId,
        totalMeals: mealInputs[uId]
      }));

      await apiClient.post('/meals/batch', {
        roomId: activeRoom._id,
        dateString: formattedDate,
        updates
      });

      Alert.alert('Success', language === 'bn' ? 'মিল সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Meals updated successfully!');
      await fetchMealsForDate();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update meals');
    } finally {
      setSaving(false);
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    let newYear = yearNum;
    let newMonth = monthNum - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setActiveMonth(newMonthStr);
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    let newYear = yearNum;
    let newMonth = monthNum + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setActiveMonth(newMonthStr);
    setSelectedDay(1);
  };

  const handleGoToToday = () => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const targetMonthStr = `${todayYear}-${String(todayMonth).padStart(2, '0')}`;
    if (activeMonth !== targetMonthStr) {
      setActiveMonth(targetMonthStr);
    }
    setSelectedDay(todayDay);
  };

  const handlePrevDay = () => {
    if (selectedDay > 1) {
      setSelectedDay((prev) => prev - 1);
    } else {
      handlePrevMonth();
      // Go to last day of previous month
      const prevMonthLastDay = new Date(yearNum, monthNum - 1, 0).getDate();
      setSelectedDay(prevMonthLastDay);
    }
  };

  const handleNextDay = () => {
    if (selectedDay < totalDaysInMonth) {
      setSelectedDay((prev) => prev + 1);
    } else {
      handleNextMonth();
      setSelectedDay(1);
    }
  };

  // Build Calendar Matrix (7 columns)
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(yearNum, monthNum - 1, 1).getDay(); // 0: Sun, 1: Mon, ...
    const daysInPrevMonth = new Date(yearNum, monthNum - 1, 0).getDate();

    const list: Array<{
      day: number;
      isCurrentMonth: boolean;
      dateString: string;
      isToday: boolean;
      dayOfWeek: number;
    }> = [];

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Leading padding days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = monthNum === 1 ? 12 : monthNum - 1;
      const prevY = monthNum === 1 ? yearNum - 1 : yearNum;
      const dStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      list.push({
        day: d,
        isCurrentMonth: false,
        dateString: dStr,
        isToday: dStr === todayStr,
        dayOfWeek: list.length % 7
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      list.push({
        day: d,
        isCurrentMonth: true,
        dateString: dStr,
        isToday: dStr === todayStr,
        dayOfWeek: list.length % 7
      });
    }

    // Trailing padding days for next month to complete the row
    const remaining = 7 - (list.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextM = monthNum === 12 ? 1 : monthNum + 1;
        const nextY = monthNum === 12 ? yearNum + 1 : yearNum;
        const dStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        list.push({
          day: d,
          isCurrentMonth: false,
          dateString: dStr,
          isToday: dStr === todayStr,
          dayOfWeek: list.length % 7
        });
      }
    }

    return list;
  }, [yearNum, monthNum, totalDaysInMonth]);

  // Week view filter
  const displayedCalendarDays = useMemo(() => {
    if (calendarViewMode === 'month') {
      return calendarDays;
    }
    // Filter to the single week containing the selectedDay
    const selectedIndex = calendarDays.findIndex(
      (item) => item.isCurrentMonth && item.day === selectedDay
    );
    if (selectedIndex === -1) return calendarDays.slice(0, 7);
    const weekStart = Math.floor(selectedIndex / 7) * 7;
    return calendarDays.slice(weekStart, weekStart + 7);
  }, [calendarDays, calendarViewMode, selectedDay]);

  // Calculate day of week for selected date
  const selectedDateObj = useMemo(() => {
    return new Date(yearNum, monthNum - 1, selectedDay);
  }, [yearNum, monthNum, selectedDay]);

  const selectedWeekdayName = FULL_WEEKDAY_NAMES[language][selectedDateObj.getDay()];
  const selectedMonthName = MONTH_NAMES[language][monthNum - 1];

  // Total meals count for that selected date
  const totalMealsSum = useMemo(() => {
    return Object.values(mealInputs).reduce((acc, val) => acc + (val || 0), 0);
  }, [mealInputs]);

  const monthTitle = `${selectedMonthName} ${fNum(yearNum)}`;

  const presetValues = [0, 1, 1.5, 2, 3];

  return (
    <View style={styles.screen}>
      <Header />

      {/* Calendar Card Section */}
      <View style={styles.calendarCard}>
        {/* Calendar Month Navigation Header */}
        <View style={styles.calendarHeaderRow}>
          <TouchableOpacity
            style={styles.navArrowBtn}
            onPress={handlePrevMonth}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#0f766e" />
          </TouchableOpacity>

          <View style={styles.monthTitleWrapper}>
            <CalendarIcon size={16} color="#0d9488" style={{ marginRight: 6 }} />
            <Text style={styles.monthTitleText}>{monthTitle}</Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.todayChip}
              onPress={handleGoToToday}
              activeOpacity={0.7}
            >
              <Text style={styles.todayChipText}>{t.today}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navArrowBtn}
              onPress={handleNextMonth}
              activeOpacity={0.7}
            >
              <ChevronRight size={20} color="#0f766e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 7-Day Weekday Labels Header */}
        <View style={styles.weekdaysRow}>
          {WEEKDAY_NAMES[language].map((wd, index) => {
            const isFridayOrWeekend = index === 5 || index === 0;
            return (
              <View key={index} style={styles.weekdayCell}>
                <Text style={[styles.weekdayText, isFridayOrWeekend && styles.weekendText]}>
                  {wd}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Calendar Grid Days */}
        <View style={styles.gridContainer}>
          {displayedCalendarDays.map((item, index) => {
            const isSelected = item.isCurrentMonth && item.day === selectedDay;

            return (
              <TouchableOpacity
                key={`${item.dateString}-${index}`}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  item.isToday && !isSelected && styles.dayCellToday
                ]}
                onPress={() => {
                  if (item.isCurrentMonth) {
                    setSelectedDay(item.day);
                  } else {
                    // Navigate to clicked month & day
                    const [y, m, d] = item.dateString.split('-').map(Number);
                    setActiveMonth(`${y}-${String(m).padStart(2, '0')}`);
                    setSelectedDay(d);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    !item.isCurrentMonth && styles.otherMonthText,
                    isSelected && styles.dayNumberSelectedText,
                    item.isToday && !isSelected && styles.todayText
                  ]}
                >
                  {fNum(item.day)}
                </Text>

                {item.isToday && (
                  <View
                    style={[
                      styles.todayIndicatorDot,
                      isSelected && styles.todayIndicatorDotSelected
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Expand / Collapse Calendar View Toggle */}
        <TouchableOpacity
          style={styles.viewToggleBtn}
          onPress={() => setCalendarViewMode((prev) => (prev === 'month' ? 'week' : 'month'))}
          activeOpacity={0.7}
        >
          <Text style={styles.viewToggleText}>
            {calendarViewMode === 'month' ? t.weekView : t.monthView}
          </Text>
          {calendarViewMode === 'month' ? (
            <ChevronUp size={14} color="#0d9488" style={{ marginLeft: 4 }} />
          ) : (
            <ChevronDown size={14} color="#0d9488" style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>
      </View>

      {/* Selected Day Action Bar */}
      <View style={styles.dateActionBar}>
        <TouchableOpacity
          style={styles.dayNavArrow}
          onPress={handlePrevDay}
          activeOpacity={0.7}
        >
          <ChevronLeft size={18} color="#0d9488" />
        </TouchableOpacity>

        <View style={styles.dateLabelCenter}>
          <Text style={styles.selectedDayFullText}>
            {selectedWeekdayName}, {fNum(selectedDay)} {selectedMonthName} {fNum(yearNum)}
          </Text>
          <View style={styles.totalBadge}>
            <Utensils size={12} color="#0d9488" style={{ marginRight: 4 }} />
            <Text style={styles.totalBadgeText}>
              {t.totalMeals}: {fNum(totalMealsSum)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.dayNavArrow}
          onPress={handleNextDay}
          activeOpacity={0.7}
        >
          <ChevronRight size={18} color="#0d9488" />
        </TouchableOpacity>
      </View>

      {/* Member Meals List */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t.batchMeals}</Text>
          <Text style={styles.sectionSub}>
            {activeRoom?.members?.length ? `${fNum(activeRoom.members.length)} ${t.member}` : ''}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 24 }} />
        ) : (
          activeRoom?.members.map((m) => {
            const uId = typeof m.userId === 'object' ? m.userId._id : m.userId;
            const name = typeof m.userId === 'object' ? m.userId.name : 'Member';
            const count = mealInputs[uId] ?? 2;

            return (
              <Card key={uId} style={styles.mealCard}>
                <View style={styles.memberTopRow}>
                  <View style={styles.avatar}>
                    <Utensils size={18} color="#0d9488" />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={styles.memberSub}>
                      {t.meals}: <Text style={styles.boldCount}>{fNum(count)}</Text>
                    </Text>
                  </View>

                  {/* Stepper with - and + */}
                  <View style={styles.counterRow}>
                    <TouchableOpacity
                      style={[styles.counterBtn, (!canEdit || count <= 0) && styles.btnDisabled]}
                      onPress={() => handleMealChange(uId, -0.5)}
                      disabled={!canEdit || count <= 0}
                      activeOpacity={0.7}
                    >
                      <Minus size={16} color="#0f172a" />
                    </TouchableOpacity>

                    <Text style={styles.countText}>{fNum(count)}</Text>

                    <TouchableOpacity
                      style={[styles.counterBtn, !canEdit && styles.btnDisabled]}
                      onPress={() => handleMealChange(uId, 0.5)}
                      disabled={!canEdit}
                      activeOpacity={0.7}
                    >
                      <Plus size={16} color="#0f172a" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quick Presets */}
                {canEdit && (
                  <View style={styles.presetRow}>
                    {presetValues.map((val) => {
                      const isPresetActive = count === val;
                      return (
                        <TouchableOpacity
                          key={val}
                          style={[
                            styles.presetChip,
                            isPresetActive && styles.presetChipActive
                          ]}
                          onPress={() => handleSetExactMeal(uId, val)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.presetChipText,
                              isPresetActive && styles.presetChipTextActive
                            ]}
                          >
                            {fNum(val)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </Card>
            );
          })
        )}

        {canEdit && (
          <CustomButton
            title={t.save}
            onPress={handleSaveMeals}
            loading={saving}
            icon={<Save size={18} color="#ffffff" />}
            style={{ marginTop: 16 }}
          />
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
  calendarCard: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  monthTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  monthTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0d9488'
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  todayChip: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6
  },
  todayChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e'
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b'
  },
  weekendText: {
    color: '#0d9488'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 4
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 20
  },
  dayCellSelected: {
    backgroundColor: '#0d9488',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa'
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  otherMonthText: {
    color: '#cbd5e1',
    fontWeight: '500'
  },
  dayNumberSelectedText: {
    color: '#ffffff',
    fontWeight: '800'
  },
  todayText: {
    color: '#0d9488',
    fontWeight: '800'
  },
  todayIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0d9488',
    marginTop: 2
  },
  todayIndicatorDotSelected: {
    backgroundColor: '#ffffff'
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 2
  },
  viewToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0d9488'
  },
  dateActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccfbf1'
  },
  dayNavArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1
  },
  dateLabelCenter: {
    alignItems: 'center'
  },
  selectedDayFullText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a'
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0d9488'
  },
  container: {
    padding: 16,
    paddingBottom: 36
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b'
  },
  mealCard: {
    padding: 14,
    marginVertical: 6,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  memberTopRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#99f6e4'
  },
  memberInfo: {
    flex: 1,
    marginLeft: 10
  },
  memberName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  memberSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1
  },
  boldCount: {
    fontWeight: '800',
    color: '#0d9488'
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },
  btnDisabled: {
    opacity: 0.35
  },
  countText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 12
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc'
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    marginRight: 6
  },
  presetChipActive: {
    backgroundColor: '#0d9488'
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  presetChipTextActive: {
    color: '#ffffff',
    fontWeight: '800'
  }
});

