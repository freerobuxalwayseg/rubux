import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/me", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    if (!users.length) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    const { passwordHash: _, ...user } = users[0];
    res.json({
      ...user,
      lastDailyReward: user.lastDailyReward?.toString() ?? null,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/daily-reward", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    if (!users.length) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    const user = users[0];
    const today = new Date().toISOString().split("T")[0];
    const lastReward = user.lastDailyReward?.toString();

    if (lastReward === today) {
      res.status(400).json({ error: "لقد استلمت مكافأتك اليومية بالفعل! عد غداً 🌙" });
      return;
    }

    const dailyBonus = 5000;
    const newPoints = user.points + dailyBonus;

    await db.update(usersTable)
      .set({
        points: newPoints,
        robuxBalance: Math.floor((newPoints / 1000) * 500),
        lastDailyReward: today,
      })
      .where(eq(usersTable.id, req.userId!));

    await db.insert(transactionsTable).values({
      userId: req.userId!,
      type: "daily_reward",
      amount: dailyBonus,
      description: "المكافأة اليومية ⭐",
    });

    res.json({ pointsEarned: dailyBonus, newTotal: newPoints });
  } catch (error) {
    console.error("Daily reward error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
