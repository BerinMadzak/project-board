import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.sendStatus(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", error });
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    return next();
  };
};
