import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.register(req.body);

      // Set HTTP-only secure cookie
      res.cookie('drivio_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, result, 'Registration successful', 201);
    } catch (error: any) {
      const msg = error.message || 'Registration failed';
      const safeMsg = msg.includes('prisma') || msg.includes('5433') || msg.includes('database')
        ? 'Registration temporarily unavailable. Please try again or use demo accounts.'
        : msg;
      sendError(res, safeMsg, 400);
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.cookie('drivio_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      const msg = error.message || 'Login failed';
      const safeMsg = msg.includes('prisma') || msg.includes('5433') || msg.includes('database')
        ? 'Invalid email or password.'
        : msg;
      sendError(res, safeMsg, 401);
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('drivio_token');
    sendSuccess(res, null, 'Logged out successfully');
  }

  public static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const profile = await AuthService.getProfile(req.user.userId);
      sendSuccess(res, profile);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch profile', 400);
    }
  }

  public static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const updated = await AuthService.updateProfile(req.user.userId, req.body);
      sendSuccess(res, updated, 'Profile updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update profile', 400);
    }
  }
}
