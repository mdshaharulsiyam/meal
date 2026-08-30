import { Request, Response, NextFunction } from 'express';
import { BazarExpenseModel } from '../models/BazarExpense.model';

export class BazarController {
  public static async createBazar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId, paidByUserId, amount, dateString, items, notes, receiptImageUrl } = req.body;
      const monthString = dateString.substring(0, 7);

      const entry = await BazarExpenseModel.create({
        roomId,
        paidByUserId: paidByUserId || req.user!.userId,
        amount,
        dateString,
        monthString,
        items: items || [],
        notes,
        receiptImageUrl,
        recordedBy: req.user!.userId
      });

      res.status(201).json({
        success: true,
        message: 'Bazar expense recorded successfully',
        data: entry
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMonthlyBazar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const { monthString } = req.query;

      const records = await BazarExpenseModel.find({
        roomId,
        monthString: monthString as string
      })
        .populate('paidByUserId', 'name phone')
        .sort({ dateString: -1 });

      res.status(200).json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteBazar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await BazarExpenseModel.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'Bazar expense deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
