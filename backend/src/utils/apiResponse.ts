import { Response } from 'express';

export class ApiResponse {
  public static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  public static error(res: Response, message: string = 'Internal Server Error', statusCode: number = 500, errors: any = null): void {
    res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }
}
