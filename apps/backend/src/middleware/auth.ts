import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

interface AuthTokenPayload {
  userId: string;
  name: string;
  emailOrPhone: string;
  institutionName: string;
}

const getBearerToken = (req: Request) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length).trim();
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = getBearerToken(req);
  if (!token) return next();

  try {
    req.authUser = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  optionalAuth(req, res, () => {
    if (!req.authUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    return next();
  });
};
