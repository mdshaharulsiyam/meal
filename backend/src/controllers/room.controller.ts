import { Request, Response, NextFunction } from 'express';
import { RoomModel } from '../models/Room.model';
import { UserModel } from '../models/User.model';
import { RoomMode, MemberRole } from '../constants/enums';
import crypto from 'crypto';

export class RoomController {
  public static async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { name, mode, defaultDailyMeals, billingCycleStartDay } = req.body;

      const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

      const newRoom = await RoomModel.create({
        name,
        mode: mode || RoomMode.SINGLE_MANAGER,
        managerId: userId,
        billingCycleStartDay: billingCycleStartDay || 1,
        inviteCode,
        lockedMonths: [],
        members: [
          {
            userId,
            role: MemberRole.MANAGER,
            defaultDailyMeals: defaultDailyMeals || 2,
            joinedAt: new Date(),
            isActive: true
          }
        ]
      });

      await UserModel.findByIdAndUpdate(userId, { activeRoomId: newRoom._id });

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: newRoom
      });
    } catch (error) {
      next(error);
    }
  }

  public static async joinRoomByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { inviteCode } = req.body;

      const room = await RoomModel.findOne({ inviteCode });
      if (!room) {
        res.status(404).json({ success: false, message: 'Invalid invite code' });
        return;
      }

      const alreadyMember = room.members.some((m) => m.userId.toString() === userId);
      if (alreadyMember) {
        res.status(400).json({ success: false, message: 'Already a member of this room' });
        return;
      }

      room.members.push({
        userId: userId as any,
        role: MemberRole.MEMBER,
        defaultDailyMeals: 2.0,
        joinedAt: new Date(),
        isActive: true
      });

      await room.save();
      await UserModel.findByIdAndUpdate(userId, { activeRoomId: room._id });

      res.status(200).json({
        success: true,
        message: 'Joined room successfully',
        data: room
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getRoomDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const room = await RoomModel.findById(roomId)
        .populate('managerId', 'name phone')
        .populate('members.userId', 'name phone preferredLanguage');

      if (!room) {
        res.status(404).json({ success: false, message: 'Room not found' });
        return;
      }

      res.status(200).json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  }

  public static async updateMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId, targetUserId, newRole, defaultDailyMeals } = req.body;
      const room = await RoomModel.findById(roomId);
      if (!room) {
        res.status(404).json({ success: false, message: 'Room not found' });
        return;
      }

      const member = room.members.find((m) => m.userId.toString() === targetUserId);
      if (!member) {
        res.status(404).json({ success: false, message: 'Member not found in room' });
        return;
      }

      if (newRole) member.role = newRole;
      if (defaultDailyMeals !== undefined) member.defaultDailyMeals = defaultDailyMeals;

      await room.save();

      res.status(200).json({
        success: true,
        message: 'Member configuration updated successfully',
        data: room
      });
    } catch (error) {
      next(error);
    }
  }

  public static async leaveRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { roomId } = req.body;

      const room = await RoomModel.findById(roomId);
      if (!room) {
        res.status(404).json({ success: false, message: 'Room not found' });
        return;
      }

      // Remove user from room members
      room.members = room.members.filter((m) => m.userId.toString() !== userId);

      // If leaving member is the manager and other members exist, transfer manager role
      if (room.managerId.toString() === userId) {
        if (room.members.length > 0) {
          room.managerId = room.members[0].userId;
          room.members[0].role = MemberRole.MANAGER;
        }
      }

      await room.save();

      // Clear user's activeRoomId
      await UserModel.findByIdAndUpdate(userId, { $unset: { activeRoomId: 1 } });

      res.status(200).json({
        success: true,
        message: 'Successfully left the room'
      });
    } catch (error) {
      next(error);
    }
  }
}
