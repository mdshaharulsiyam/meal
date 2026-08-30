import mongoose, { Document, Schema } from 'mongoose';
import { UtilityCategory } from '../constants/enums';

export interface IUtilityBill extends Document {
  _id: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  title: string;
  category: UtilityCategory;
  amount: number;
  monthString: string; // YYYY-MM
  dueDate?: Date;
  paidByUserId?: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UtilityBillSchema = new Schema<IUtilityBill>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: Object.values(UtilityCategory),
      default: UtilityCategory.OTHER
    },
    amount: { type: Number, required: true, min: 0 },
    monthString: { type: String, required: true, index: true },
    dueDate: { type: Date },
    paidByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const UtilityBillModel = mongoose.model<IUtilityBill>('UtilityBill', UtilityBillSchema);
