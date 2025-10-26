import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to check if the user has the correct role
export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET); // Decode the token
      const userRole = decoded.role; // Get the role from the decoded token

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient role' });
      }

      req.user = decoded; // Attach user info to request for access in routes
      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  };
};