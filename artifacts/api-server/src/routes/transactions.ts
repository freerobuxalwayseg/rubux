import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const transactions = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, req.userId!))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(50);

    res.json(transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
