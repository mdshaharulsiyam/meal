export enum RoomMode {
  SINGLE_MANAGER = 'SINGLE_MANAGER',
  COLLABORATIVE = 'COLLABORATIVE'
}

export enum MemberRole {
  MANAGER = 'MANAGER',
  DELEGATED_EDITOR = 'DELEGATED_EDITOR',
  MEMBER = 'MEMBER'
}

export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  isVerified?: boolean;
  defaultMealsPerDay: number;
  preferredLanguage?: 'en' | 'bn';
  activeRoomId?: string;
}

export interface RoomMember {
  userId: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
  } | string;
  role: MemberRole;
  isActive: boolean;
  defaultMeals?: number;
}

export interface Room {
  _id: string;
  roomCode: string;
  inviteCode?: string;
  name: string;
  mode: RoomMode;
  managerId: string;
  members: RoomMember[];
  activeMonth: string;
  lockedMonths: string[];
  createdAt: string;
}

export interface DailyMeal {
  _id: string;
  roomId: string;
  userId: string;
  dateString: string;
  totalMeals: number;
  breakfast?: number;
  lunch?: number;
  dinner?: number;
}

export interface BazarExpense {
  _id: string;
  roomId: string;
  paidByUserId: string | { _id: string; name: string };
  amount: number;
  dateString: string;
  monthString: string;
  description: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface JomaDeposit {
  _id: string;
  roomId: string;
  userId: string | { _id: string; name: string };
  amount: number;
  dateString: string;
  monthString: string;
  note?: string;
  createdAt: string;
}

export interface UtilityBill {
  _id: string;
  roomId: string;
  title: string;
  amount: number;
  monthString: string;
  dateString: string;
  createdAt: string;
}

export interface MemberSettlementResult {
  userId: string;
  userName: string;
  userPhone: string;
  totalMeals: number;
  personalMealCost: number;
  personalUtilityShare: number;
  totalPersonalCost: number;
  personalJoma: number;
  personalBazarSpent: number;
  netBalance: number; // >0 refund (পাবেন), <0 due (দিতে হবে)
}

export interface MonthlySettlementSummary {
  monthString: string;
  roomMode: RoomMode;
  totalRoomMeals: number;
  totalBazarExpense: number;
  totalUtilityBills: number;
  totalJomaCollected: number;
  mealRate: number;
  memberResults: MemberSettlementResult[];
}
