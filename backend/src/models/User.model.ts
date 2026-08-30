import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  preferredLanguage: 'en' | 'bn';
  defaultMealsPerDay: number;
  isVerified: boolean;
  otpCode?: string;
  otpExpiresAt?: Date;
  activeRoomId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    preferredLanguage: { type: String, enum: ['en', 'bn'], default: 'bn' },
    defaultMealsPerDay: { type: Number, default: 2 },
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
    activeRoomId: { type: Schema.Types.ObjectId, ref: 'Room' }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
