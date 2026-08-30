import { Request, Response, NextFunction } from 'express';
import { UtilityBillModel } from '../models/UtilityBill.model';

export class UtilityController {
  public static async createUtility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId, title, category, amount, monthString, dueDate, paidByUserId } = req.body;

      const entry = await UtilityBillModel.create({
        roomId,
        title,
        category,
        amount,
        monthString,
        dueDate,
        paidByUserId,
        recordedBy: req.user!.userId
      });

      res.status(201).json({
        success: true,
        message: 'Utility bill recorded successfully',
        data: entry
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMonthlyUtilities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const { monthString } = req.query;

      const records = await UtilityBillModel.find({
        roomId,
        monthString: monthString as string
      })
        .populate('paidByUserId', 'name phone')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteUtility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await UtilityBillModel.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'Utility bill deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
