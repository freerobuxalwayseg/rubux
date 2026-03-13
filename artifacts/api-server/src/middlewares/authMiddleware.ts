import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { parseToken } from "../lib/auth.js";

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }

  const token = authHeader.slice(7);
  const userId = parseToken(token);

  if (!userId) {
    res.status(401).json({ error: "رمز غير صالح" });
    return;
  }

  const user = await db.select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user.length) {
    res.status(401).json({ error: "المستخدم غير موجود" });
    return;
  }

  req.userId = userId;
  next();
}
