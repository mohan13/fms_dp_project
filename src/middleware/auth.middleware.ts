import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.ts';
import { asyncHandler } from '../utils/asynchHandler.ts';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.ts';
import type { Role, Gender } from '../generated/prisma/enums.ts';

export interface AuthRequest extends Request {
  user: {
    id: string;
    name?: string;
    email: string;
    gender: Gender;
    role: Role;
    created_at: Date;
  };
}

export const verifyToken = asyncHandler(
  async (req: AuthRequest, _: any, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header('Authorization')?.replace('Bearer ', '');
      console.log('middle', token);
      if (!token) {
        throw new ApiError(401, 'Access token is missing');
      }
      // Here you would typically verify the token using a library like jsonwebtoken
      // For example:
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // req.user = decoded; // Attach user info to the request object
      const decodedToken: any = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
      );

      const user: any = await prisma.user.findUnique({
        where: { id: decodedToken?.id },
        select: { id: true, email: true, role: true, gender: true },
      });

      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      //@ts-ignore
      req.user = user; // Attach user info to the request object
      next();
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, error?.message || 'Token expired');
      }

      throw new ApiError(401, error?.message || 'Invalid access token');
    }
  },
);

// ─────────────────────────────────────────
// AUTHORIZE ROLE
// Usage: authorizeRole("ADMIN", "HOST")
// ─────────────────────────────────────────
export const authorizeRole = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Not Authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Access denied. Required: ${roles.join(' or ')}`);
    }
    next();
  };
};

// ─────────────────────────────────────────
// AUTHORIZE SELF OR ADMIN
// Usage: authorizeSelfOrAdmin("userId")
// ─────────────────────────────────────────
export const authorizeSelfOrAdmin = (paramName: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Not Authenticated');
    }

    const isSelf = req.user.id === req.params[paramName];
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSelf && !isAdmin) {
      throw new ApiError(
        403,
        'Access denied. You can only access your own resources.',
      );
    }

    next();
  };
};
