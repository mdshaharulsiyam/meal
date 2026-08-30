import mongoose, { Document, Schema } from 'mongoose';
import { RoomMode } from '../constants/enums';

export interface IMemberSettlementSnapshot {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userPhone: string;
  totalMeals: number;
  personalMealCost: number;
  personalUtilityShare: number;
  totalPersonalCost: number;
  personalJoma: number;
  personalBazarSpent: number;
  netBalance: number;
}

export interface IMonthlySnapshot extends Document {
  _id: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  monthString: string; // YYYY-MM
  roomMode: RoomMode;
  totalRoomMeals: number;
  totalBazarCost: number;
  totalUtilityCost: number;
  totalJomaCollected: number;
  mealRate: number;
  memberSettlements: IMemberSettlementSnapshot[];
  closedBy: mongoose.Types.ObjectId;
  closedAt: Date;
}

const MemberSettlementSchema = new Schema<IMemberSettlementSnapshot>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    totalMeals: { type: Number, required: true },
    personalMealCost: { type: Number, required: true },
    personalUtilityShare: { type: Number, required: true },
    totalPersonalCost: { type: Number, required: true },
    personalJoma: { type: Number, required: true },
    personalBazarSpent: { type: Number, required: true },
    netBalance: { type: Number, required: true }
  },
  { _id: false }
);

const MonthlySnapshotSchema = new Schema<IMonthlySnapshot>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    monthString: { type: String, required: true },
    roomMode: { type: String, enum: Object.values(RoomMode), required: true },
    totalRoomMeals: { type: Number, required: true },
    totalBazarCost: { type: Number, required: true },
    totalUtilityCost: { type: Number, required: true },
    totalJomaCollected: { type: Number, required: true },
    mealRate: { type: Number, required: true },
    memberSettlements: [MemberSettlementSchema],
    closedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    closedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

MonthlySnapshotSchema.index({ roomId: 1, monthString: 1 }, { unique: true });

export const MonthlySnapshotModel = mongoose.model<IMonthlySnapshot>(
  'MonthlySnapshot',
  MonthlySnapshotSchema
);
