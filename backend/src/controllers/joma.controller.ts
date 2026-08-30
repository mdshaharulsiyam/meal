import { Request, Response, NextFunction } from 'express';
import { JomaDepositModel } from '../models/JomaDeposit.model';

export class JomaController {
  public static async createJoma(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId, userId, amount, dateString, paymentMethod, transactionRef } = req.body;
      const monthString = dateString.substring(0, 7);

      const entry = await JomaDepositModel.create({
        roomId,
        userId: userId || req.user!.userId,
        amount,
        dateString,
        monthString,
        paymentMethod,
        transactionRef,
        recordedBy: req.user!.userId
      });

      res.status(201).json({
        success: true,
        message: 'Joma deposit recorded successfully',
        data: entry
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMonthlyJoma(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const { monthString } = req.query;

      const records = await JomaDepositModel.find({
        roomId,
        monthString: monthString as string
      })
        .populate('userId', 'name phone')
        .sort({ dateString: -1 });

      res.status(200).json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteJoma(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await JomaDepositModel.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'Joma deposit deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
