import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!process.env.CLERK_SECRET_KEY) {
    next();
    return;
  }
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Authentication required" });
  }
}