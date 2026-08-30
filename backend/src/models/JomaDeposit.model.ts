import mongoose, { Document, Schema } from 'mongoose';
import { PaymentMethod } from '../constants/enums';

export interface IJomaDeposit extends Document {
  _id: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  dateString: string; // YYYY-MM-DD
  monthString: string; // YYYY-MM
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JomaDepositSchema = new Schema<IJomaDeposit>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    dateString: { type: String, required: true, index: true },
    monthString: { type: String, required: true, index: true },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.CASH
    },
    transactionRef: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const JomaDepositModel = mongoose.model<IJomaDeposit>('JomaDeposit', JomaDepositSchema);
