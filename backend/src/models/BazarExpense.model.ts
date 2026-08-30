import mongoose, { Document, Schema } from 'mongoose';

export interface IBazarItem {
  name: string;
  quantity?: string;
  cost: number;
}

export interface IBazarExpense extends Document {
  _id: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  paidByUserId: mongoose.Types.ObjectId;
  amount: number;
  dateString: string; // YYYY-MM-DD
  monthString: string; // YYYY-MM
  items: IBazarItem[];
  notes?: string;
  receiptImageUrl?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BazarItemSchema = new Schema<IBazarItem>(
  {
    name: { type: String, required: true },
    quantity: { type: String },
    cost: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const BazarExpenseSchema = new Schema<IBazarExpense>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    paidByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    dateString: { type: String, required: true, index: true },
    monthString: { type: String, required: true, index: true },
    items: [BazarItemSchema],
    notes: { type: String },
    receiptImageUrl: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const BazarExpenseModel = mongoose.model<IBazarExpense>('BazarExpense', BazarExpenseSchema);
