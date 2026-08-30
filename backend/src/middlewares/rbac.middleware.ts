import { Request, Response, NextFunction } from 'express';
import { RoomModel } from '../models/Room.model';
import { RoomMode, MemberRole } from '../constants/enums';

export const requireRoomAccess = (allowedRoles: MemberRole[] = []) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const roomId = req.params.roomId || req.body.roomId || req.query.roomId;

      if (!userId || !roomId) {
        res.status(400).json({ success: false, message: 'User ID and Room ID are required.' });
        return;
      }

      const room = await RoomModel.findById(roomId);
      if (!room) {
        res.status(404).json({ success: false, message: 'Room not found.' });
        return;
      }

      // Check if target month is locked
      const targetMonth = req.body.monthString || (req.body.dateString ? req.body.dateString.substring(0, 7) : null) || req.query.monthString;
      if (targetMonth && room.lockedMonths.includes(targetMonth as string) && req.method !== 'GET') {
        res.status(403).json({
          success: false,
          message: `The month ${targetMonth} is closed and locked against any edits.`
        });
        return;
      }

      // Collaborative Mode: All members hold equal write access
      if (room.mode === RoomMode.COLLABORATIVE) {
        const isMember = room.members.some((m) => m.userId.toString() === userId && m.isActive);
        if (!isMember) {
          res.status(403).json({ success: false, message: 'Access denied: not an active room member.' });
          return;
        }
        next();
        return;
      }

      // Single Manager Mode: Check specific role permissions
      const member = room.members.find((m) => m.userId.toString() === userId && m.isActive);
      if (!member) {
        res.status(403).json({ success: false, message: 'Access denied: not an active member in this room.' });
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
        res.status(403).json({
          success: false,
          message: `Forbidden: Action requires one of the following roles: [${allowedRoles.join(', ')}]`
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
