import { Request, Response, NextFunction } from 'express';
import { RoomModel } from '../models/Room.model';
import { DailyMealModel } from '../models/DailyMeal.model';
import { BazarExpenseModel } from '../models/BazarExpense.model';
import { JomaDepositModel } from '../models/JomaDeposit.model';
import { UtilityBillModel } from '../models/UtilityBill.model';
import { MonthlySnapshotModel } from '../models/MonthlySnapshot.model';
import { CalculationService, IMemberRawInput } from '../services/calculation.service';
import mongoose from 'mongoose';

export class SettlementController {
  public static async getMonthlySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const { monthString } = req.query;

      if (!monthString) {
        res.status(400).json({ success: false, message: 'monthString query parameter is required' });
        return;
      }

      // If already closed and locked, return immutable snapshot
      const existingSnapshot = await MonthlySnapshotModel.findOne({
        roomId,
        monthString: monthString as string
      });

      if (existingSnapshot) {
        res.status(200).json({
          success: true,
          isLocked: true,
          data: existingSnapshot
        });
        return;
      }

      const room = await RoomModel.findById(roomId).populate('members.userId', 'name phone');
      if (!room) {
        res.status(404).json({ success: false, message: 'Room not found' });
        return;
      }

      const meals = await DailyMealModel.find({
        roomId,
        dateString: { $regex: `^${monthString}` }
      });

      const bazarList = await BazarExpenseModel.find({ roomId, monthString: monthString as string });
      const totalBazarExpenses = bazarList.reduce((sum, b) => sum + b.amount, 0);

      const utilityList = await UtilityBillModel.find({ roomId, monthString: monthString as string });
      const totalUtilityBills = utilityList.reduce((sum, u) => sum + u.amount, 0);

      const jomaList = await JomaDepositModel.find({ roomId, monthString: monthString as string });

      const membersData: IMemberRawInput[] = room.members
        .filter((m) => m.isActive)
        .map((m: any) => {
          const uId = (m.userId?._id || m.userId).toString();
          const userMeals = meals
            .filter((meal) => meal.userId.toString() === uId)
            .reduce((sum, meal) => sum + meal.totalMeals, 0);

          const userJoma = jomaList
            .filter((j) => j.userId.toString() === uId)
            .reduce((sum, j) => sum + j.amount, 0);

          const userBazar = bazarList
            .filter((b) => b.paidByUserId.toString() === uId)
            .reduce((sum, b) => sum + b.amount, 0);

          return {
            userId: uId,
            userName: m.userId?.name || 'Member',
            userPhone: m.userId?.phone || '',
            totalMeals: userMeals,
            personalJoma: userJoma,
            personalBazarSpent: userBazar
          };
        });

      const calculation = CalculationService.calculateMessBalances({
        monthString: monthString as string,
        roomMode: room.mode,
        membersData,
        totalBazarExpenses,
        totalUtilityBills
      });

      res.status(200).json({
        success: true,
        isLocked: false,
        data: calculation
      });
    } catch (error) {
      next(error);
    }
  }

  public static async closeAndLockMonth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { roomId, monthString } = req.body;
      const userId = req.user!.userId;

      const room = await RoomModel.findById(roomId).populate('members.userId', 'name phone');
      if (!room) {
        res.status(404).json({ success: false, message: 'Room not found' });
        return;
      }

      if (room.lockedMonths.includes(monthString)) {
        res.status(400).json({ success: false, message: 'Month is already finalized and locked.' });
        return;
      }

      const meals = await DailyMealModel.find({ roomId, dateString: { $regex: `^${monthString}` } });
      const bazarList = await BazarExpenseModel.find({ roomId, monthString });
      const totalBazarExpenses = bazarList.reduce((sum, b) => sum + b.amount, 0);
      const utilityList = await UtilityBillModel.find({ roomId, monthString });
      const totalUtilityBills = utilityList.reduce((sum, u) => sum + u.amount, 0);
      const jomaList = await JomaDepositModel.find({ roomId, monthString });

      const membersData: IMemberRawInput[] = room.members
        .filter((m) => m.isActive)
        .map((m: any) => {
          const uId = (m.userId?._id || m.userId).toString();
          return {
            userId: uId,
            userName: m.userId?.name || 'Member',
            userPhone: m.userId?.phone || '',
            totalMeals: meals.filter((meal) => meal.userId.toString() === uId).reduce((sum, meal) => sum + meal.totalMeals, 0),
            personalJoma: jomaList.filter((j) => j.userId.toString() === uId).reduce((sum, j) => sum + j.amount, 0),
            personalBazarSpent: bazarList.filter((b) => b.paidByUserId.toString() === uId).reduce((sum, b) => sum + b.amount, 0)
          };
        });

      const summary = CalculationService.calculateMessBalances({
        monthString,
        roomMode: room.mode,
        membersData,
        totalBazarExpenses,
        totalUtilityBills
      });

      await MonthlySnapshotModel.create(
        [
          {
            roomId: room._id,
            monthString,
            roomMode: room.mode,
            totalRoomMeals: summary.totalRoomMeals,
            totalBazarCost: summary.totalBazarExpense,
            totalUtilityCost: summary.totalUtilityBills,
            totalJomaCollected: summary.totalJomaCollected,
            mealRate: summary.mealRate,
            memberSettlements: summary.memberResults.map((r) => ({
              userId: r.userId,
              userName: r.userName,
              userPhone: r.userPhone,
              totalMeals: r.totalMeals,
              personalMealCost: r.personalMealCost,
              personalUtilityShare: r.personalUtilityShare,
              totalPersonalCost: r.totalPersonalCost,
              personalJoma: r.personalJoma,
              personalBazarSpent: r.personalBazarSpent,
              netBalance: r.netBalance
            })),
            closedBy: userId,
            closedAt: new Date()
          }
        ],
        { session }
      );

      room.lockedMonths.push(monthString);
      await room.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: `Month ${monthString} has been successfully closed, settled, and locked.`
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  }
}
