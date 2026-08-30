import { RoomMode } from '../constants/enums';

export interface IMemberRawInput {
  userId: string;
  userName: string;
  userPhone: string;
  totalMeals: number;
  personalJoma: number;
  personalBazarSpent: number;
}

export interface IMemberCalculatedResult {
  userId: string;
  userName: string;
  userPhone: string;
  totalMeals: number;
  personalMealCost: number;
  personalUtilityShare: number;
  totalPersonalCost: number;
  personalJoma: number;
  personalBazarSpent: number;
  netBalance: number; // Positive = Refund (Paben), Negative = Due (Dite Hobe)
  status: 'REFUND' | 'DUE' | 'BALANCED';
}

export interface IRoomCalculationSummary {
  monthString: string;
  roomMode: RoomMode;
  totalRoomMeals: number;
  totalBazarExpense: number;
  totalUtilityBills: number;
  totalJomaCollected: number;
  activeMemberCount: number;
  mealRate: number;
  memberResults: IMemberCalculatedResult[];
}

export class CalculationService {
  /**
   * Helper to prevent JavaScript floating-point inaccuracies
   */
  public static round2(val: number): number {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }

  /**
   * Calculates entire mess breakdown for a given month and mode
   */
  public static calculateMessBalances(params: {
    monthString: string;
    roomMode: RoomMode;
    membersData: IMemberRawInput[];
    totalBazarExpenses: number;
    totalUtilityBills: number;
  }): IRoomCalculationSummary {
    const { monthString, roomMode, membersData, totalBazarExpenses, totalUtilityBills } = params;

    const activeMemberCount = membersData.length;
    if (activeMemberCount === 0) {
      throw new Error('Cannot calculate balances for a room with zero active members.');
    }

    // 1. Calculate Total Room Meals
    const totalRoomMeals = CalculationService.round2(
      membersData.reduce((acc, m) => acc + (m.totalMeals || 0), 0)
    );

    // 2. Dynamic Meal Rate Calculation (Protected against Division-by-Zero)
    const mealRate =
      totalRoomMeals > 0
        ? CalculationService.round2(totalBazarExpenses / totalRoomMeals)
        : 0;

    // 3. Utility Bill Allocation (Split equally across all members)
    const personalUtilityShare = CalculationService.round2(
      totalUtilityBills / activeMemberCount
    );

    let totalJomaCollected = 0;

    // 4. Calculate Individual Member Ledgers
    const memberResults: IMemberCalculatedResult[] = membersData.map((member) => {
      totalJomaCollected += member.personalJoma;

      // Personal Meal Cost = Member Meals * Meal Rate
      const personalMealCost = CalculationService.round2(member.totalMeals * mealRate);

      // Total Personal Cost = Meal Cost + Utility Share
      const totalPersonalCost = CalculationService.round2(
        personalMealCost + personalUtilityShare
      );

      let netBalance = 0;

      if (roomMode === RoomMode.SINGLE_MANAGER) {
        // MODE 1: Net Balance = (Personal Joma + Personal Bazar) - Total Personal Cost
        const totalCredits = CalculationService.round2(member.personalJoma + member.personalBazarSpent);
        netBalance = CalculationService.round2(totalCredits - totalPersonalCost);
      } else {
        // MODE 2 (Collaborative): Net Balance = Personal Bazar Spent - Total Personal Cost
        netBalance = CalculationService.round2(member.personalBazarSpent - totalPersonalCost);
      }

      let status: 'REFUND' | 'DUE' | 'BALANCED' = 'BALANCED';
      if (netBalance > 0.01) {
        status = 'REFUND';
      } else if (netBalance < -0.01) {
        status = 'DUE';
      }

      return {
        userId: member.userId,
        userName: member.userName,
        userPhone: member.userPhone,
        totalMeals: member.totalMeals,
        personalMealCost,
        personalUtilityShare,
        totalPersonalCost,
        personalJoma: member.personalJoma,
        personalBazarSpent: member.personalBazarSpent,
        netBalance,
        status
      };
    });

    return {
      monthString,
      roomMode,
      totalRoomMeals,
      totalBazarExpense: CalculationService.round2(totalBazarExpenses),
      totalUtilityBills: CalculationService.round2(totalUtilityBills),
      totalJomaCollected: CalculationService.round2(totalJomaCollected),
      activeMemberCount,
      mealRate,
      memberResults
    };
  }
}
