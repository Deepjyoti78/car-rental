import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyJwtToken, TokenPayload } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticateJwt(req: Request, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.drivio_token) {
      token = req.cookies.drivio_token;
    }

    if (!token) {
      sendError(res, 'Authentication required. No token provided.', 401);
      return;
    }

    const decoded = verifyJwtToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired authentication session.', 401);
    return;
  }
}

export function optionalAuthenticateJwt(req: Request, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.drivio_token) {
      token = req.cookies.drivio_token;
    }

    if (token) {
      const decoded = verifyJwtToken(token);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Optional auth - proceed without user
    next();
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Requires one of [${allowedRoles.join(', ')}] permissions.`,
        403
      );
      return;
    }

    next();
  };
}
