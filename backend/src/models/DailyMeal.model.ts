import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyMeal extends Document {
  _id: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  dateString: string; // YYYY-MM-DD
  breakfast: number;
  lunch: number;
  dinner: number;
  totalMeals: number;
  isCustomOverride: boolean;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DailyMealSchema = new Schema<IDailyMeal>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateString: { type: String, required: true, index: true },
    breakfast: { type: Number, default: 0, min: 0 },
    lunch: { type: Number, default: 1, min: 0 },
    dinner: { type: Number, default: 1, min: 0 },
    totalMeals: { type: Number, required: true, min: 0 },
    isCustomOverride: { type: Boolean, default: false },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

DailyMealSchema.index({ roomId: 1, userId: 1, dateString: 1 }, { unique: true });

DailyMealSchema.pre('validate', function (next) {
  this.totalMeals = Number(((this.breakfast || 0) + (this.lunch || 0) + (this.dinner || 0)).toFixed(2));
  next();
});

export const DailyMealModel = mongoose.model<IDailyMeal>('DailyMeal', DailyMealSchema);
