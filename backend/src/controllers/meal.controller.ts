import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { DailyMealModel } from '../models/DailyMeal.model';
import { RoomModel } from '../models/Room.model';

export class MealController {
  public static async getDailyMeals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const { dateString } = req.query;

      if (!dateString) {
        res.status(400).json({ success: false, message: 'dateString is required (YYYY-MM-DD)' });
        return;
      }

      const room = await RoomModel.findById(roomId).populate('members.userId', 'name phone');
      if (!room) {
        res.status(404).json({ success: false, message: 'Room not found' });
        return;
      }

      let existingMeals = await DailyMealModel.find({
        roomId,
        dateString: dateString as string
      }).populate('userId', 'name phone');

      // Auto-fill logic for members with no entry on this day
      const existingUserIds = new Set(existingMeals.map((m) => (m.userId as any)?._id?.toString() || (m.userId as any)?.toString()));
      const unrecordedMembers = room.members.filter(
        (m) => m.isActive && !existingUserIds.has((m.userId as any)?._id?.toString() || (m.userId as any)?.toString())
      );

      if (unrecordedMembers.length > 0) {
        const defaultEntries = unrecordedMembers.map((member) => {
          const defaults = member.defaultDailyMeals || 2;
          const breakfast = defaults > 2 ? 1 : 0;
          const lunch = defaults >= 1 ? 1 : 0;
          const dinner = defaults >= 2 ? 1 : 0;

          return {
            roomId: room._id,
            userId: (member.userId as any)._id || member.userId,
            dateString: dateString as string,
            breakfast,
            lunch,
            dinner,
            totalMeals: breakfast + lunch + dinner,
            isCustomOverride: false,
            recordedBy: req.user!.userId
          };
        });

        const created = await DailyMealModel.insertMany(defaultEntries);
        const populatedCreated = await DailyMealModel.find({
          _id: { $in: created.map((c) => c._id) }
        }).populate('userId', 'name phone');

        existingMeals = [...existingMeals, ...populatedCreated];
      }

      res.status(200).json({
        success: true,
        data: existingMeals
      });
    } catch (error) {
      next(error);
    }
  }

  public static async batchUpdateMeals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId, dateString, updates } = req.body;

      if (!roomId || !dateString || !Array.isArray(updates)) {
        res.status(400).json({ success: false, message: 'roomId, dateString, and updates array are required' });
        return;
      }

      const bulkOps = updates.map(
        (u: { userId: string; breakfast: number; lunch: number; dinner: number }) => {
          const totalMeals = Number(((u.breakfast || 0) + (u.lunch || 0) + (u.dinner || 0)).toFixed(2));
          return {
            updateOne: {
              filter: { roomId, userId: u.userId, dateString },
              update: {
                $set: {
                  breakfast: u.breakfast,
                  lunch: u.lunch,
                  dinner: u.dinner,
                  totalMeals,
                  isCustomOverride: true,
                  recordedBy: new mongoose.Types.ObjectId(req.user!.userId)
                }
              },
              upsert: true
            }
          };
        }
      );

      await DailyMealModel.bulkWrite(bulkOps);

      res.status(200).json({
        success: true,
        message: 'Daily meals updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
