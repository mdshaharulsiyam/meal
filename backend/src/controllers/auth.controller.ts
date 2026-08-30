import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.model';
import { ENV } from '../config/environment';
import { sendAccountEmail } from '../services/mail.service';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, phone, email, password, preferredLanguage } = req.body;

      if (!name || !phone || !password) {
        res.status(400).json({ success: false, message: 'Name, phone, and password are required' });
        return;
      }

      const existingPhone = await UserModel.findOne({ phone: phone.trim() });
      if (existingPhone) {
        res.status(400).json({ success: false, message: 'Phone number already registered' });
        return;
      }

      if (email) {
        const existingEmail = await UserModel.findOne({ email: email.trim().toLowerCase() });
        if (existingEmail) {
          res.status(400).json({ success: false, message: 'Email address already registered' });
          return;
        }
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const otpCode = generateOtp();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const user = await UserModel.create({
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : undefined,
        passwordHash,
        preferredLanguage: preferredLanguage || 'bn',
        isVerified: false,
        otpCode,
        otpExpiresAt
      });

      // Send OTP email if email provided
      if (user.email) {
        await sendAccountEmail({
          to: user.email,
          subject: 'Mess Meal Manager — Email Verification Code',
          text: `Hello ${user.name},\n\nYour OTP verification code for Mess Meal Manager is: ${otpCode}\n\nThis code expires in 10 minutes.`
        });
      }

      res.status(201).json({
        success: true,
        requiresOtp: true,
        message: 'Registration successful. Verification code has been sent to your email.',
        data: {
          userId: user._id,
          phone: user.phone,
          email: user.email
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phoneOrEmail, otp } = req.body;

      if (!phoneOrEmail || !otp) {
        res.status(400).json({ success: false, message: 'Phone/Email and OTP are required' });
        return;
      }

      const queryVal = phoneOrEmail.trim();
      const user = await UserModel.findOne({
        $or: [{ phone: queryVal }, { email: queryVal.toLowerCase() }]
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (!user.otpCode || user.otpCode !== otp.trim()) {
        res.status(400).json({ success: false, message: 'Invalid OTP code' });
        return;
      }

      if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
        res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        return;
      }

      user.isVerified = true;
      user.otpCode = undefined;
      user.otpExpiresAt = undefined;
      await user.save();

      const token = jwt.sign({ userId: user._id, phone: user.phone }, ENV.JWT_SECRET, {
        expiresIn: '30d'
      });

      res.status(200).json({
        success: true,
        message: 'Account verified successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          defaultMealsPerDay: user.defaultMealsPerDay,
          preferredLanguage: user.preferredLanguage,
          activeRoomId: user.activeRoomId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phoneOrEmail } = req.body;

      if (!phoneOrEmail) {
        res.status(400).json({ success: false, message: 'Phone or email is required' });
        return;
      }

      const queryVal = phoneOrEmail.trim();
      const user = await UserModel.findOne({
        $or: [{ phone: queryVal }, { email: queryVal.toLowerCase() }]
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const otpCode = generateOtp();
      user.otpCode = otpCode;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      if (user.email) {
        await sendAccountEmail({
          to: user.email,
          subject: 'Mess Meal Manager — Verification Code',
          text: `Hello ${user.name},\n\nYour new OTP code is: ${otpCode}\n\nThis code expires in 10 minutes.`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Verification code resent successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phoneOrEmail, password } = req.body;

      if (!phoneOrEmail || !password) {
        res.status(400).json({ success: false, message: 'Phone/Email and password are required' });
        return;
      }

      const queryVal = phoneOrEmail.trim();
      const user = await UserModel.findOne({
        $or: [{ phone: queryVal }, { email: queryVal.toLowerCase() }]
      });

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid phone/email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid phone/email or password' });
        return;
      }

      if (!user.isVerified) {
        // Send a fresh OTP if unverified
        const otpCode = generateOtp();
        user.otpCode = otpCode;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        if (user.email) {
          await sendAccountEmail({
            to: user.email,
            subject: 'Mess Meal Manager — Verification Code',
            text: `Hello ${user.name},\n\nYour verification code is: ${otpCode}\n\nThis code expires in 10 minutes.`
          });
        }

        res.status(403).json({
          success: false,
          requiresOtp: true,
          message: 'Account is not verified yet. Verification code has been sent to your email.'
        });
        return;
      }

      const token = jwt.sign({ userId: user._id, phone: user.phone }, ENV.JWT_SECRET, {
        expiresIn: '30d'
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          defaultMealsPerDay: user.defaultMealsPerDay,
          preferredLanguage: user.preferredLanguage,
          activeRoomId: user.activeRoomId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phoneOrEmail } = req.body;

      if (!phoneOrEmail) {
        res.status(400).json({ success: false, message: 'Phone or Email is required' });
        return;
      }

      const queryVal = phoneOrEmail.trim();
      const user = await UserModel.findOne({
        $or: [{ phone: queryVal }, { email: queryVal.toLowerCase() }]
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'No account found with this phone or email' });
        return;
      }

      const otpCode = generateOtp();
      user.otpCode = otpCode;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      if (user.email) {
        await sendAccountEmail({
          to: user.email,
          subject: 'Mess Meal Manager — Password Reset OTP',
          text: `Hello ${user.name},\n\nYou requested to reset your password. Your OTP reset code is: ${otpCode}\n\nThis code expires in 10 minutes.`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Password reset OTP code sent to your email.'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phoneOrEmail, otp, newPassword } = req.body;

      if (!phoneOrEmail || !otp || !newPassword) {
        res.status(400).json({ success: false, message: 'Phone/Email, OTP, and new password are required' });
        return;
      }

      const queryVal = phoneOrEmail.trim();
      const user = await UserModel.findOne({
        $or: [{ phone: queryVal }, { email: queryVal.toLowerCase() }]
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (!user.otpCode || user.otpCode !== otp.trim()) {
        res.status(400).json({ success: false, message: 'Invalid OTP code' });
        return;
      }

      if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
        res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      user.otpCode = undefined;
      user.otpExpiresAt = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { name, defaultMealsPerDay, preferredLanguage } = req.body;

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (name) user.name = name.trim();
      if (defaultMealsPerDay !== undefined) user.defaultMealsPerDay = parseFloat(defaultMealsPerDay) || 2;
      if (preferredLanguage) user.preferredLanguage = preferredLanguage;

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          defaultMealsPerDay: user.defaultMealsPerDay,
          preferredLanguage: user.preferredLanguage,
          activeRoomId: user.activeRoomId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserModel.findById(req.user!.userId).select('-passwordHash -otpCode');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }
}
