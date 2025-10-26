import winston from 'winston';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

// Winston Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

/**
 * Persist significant logs into DB
 * 'details' is optional to avoid breaking existing calls
 */
export const saveAuditLog = async (
  req: Request,
  userId: number,
  action: string,
  description: string,
  details?: string // ✅ made optional
) => {
  try {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const logIpAddress =
      req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        userAgent,
        logIpAddress,
        logDescription: description,
        actionDetails: details || '', // ✅ fallback to empty string
      },
    });

    logger.info(`AuditLog saved for user ${userId} | Action: ${action}`);
  } catch (err) {
    logger.error('Failed to save audit log: %o', err);
  }
};

export default logger;
