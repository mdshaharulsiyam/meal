import mongoose, { Document, Schema } from 'mongoose';
import { RoomMode, MemberRole } from '../constants/enums';

export interface IRoomMember {
  userId: mongoose.Types.ObjectId;
  role: MemberRole;
  defaultDailyMeals: number; // e.g. 2.0 (Breakfast=0, Lunch=1, Dinner=1)
  joinedAt: Date;
  isActive: boolean;
}

export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  mode: RoomMode;
  managerId: mongoose.Types.ObjectId;
  members: IRoomMember[];
  billingCycleStartDay: number; // e.g. 1
  lockedMonths: string[]; // YYYY-MM
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoomMemberSchema = new Schema<IRoomMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: Object.values(MemberRole),
      default: MemberRole.MEMBER
    },
    defaultDailyMeals: { type: Number, default: 2.0, min: 0 },
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true, trim: true },
    mode: {
      type: String,
      enum: Object.values(RoomMode),
      required: true
    },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [RoomMemberSchema],
    billingCycleStartDay: { type: Number, default: 1, min: 1, max: 28 },
    lockedMonths: [{ type: String }],
    inviteCode: { type: String, unique: true, required: true }
  },
  { timestamps: true }
);

export const RoomModel = mongoose.model<IRoom>('Room', RoomSchema);
