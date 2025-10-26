import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded === 'string') {
      return res.status(401).send('Invalid token');
    }
    req.user = decoded as User;
    next();
  } catch (error) {
    res.status(401).send('Invalid token');
  }
};

export { authenticate };