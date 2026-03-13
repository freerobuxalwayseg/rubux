import { Router } from "express";
import { db } from "@workspace/db";
import { rewardsTable, usersTable, redemptionsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const rewards = await db.select().from(rewardsTable).orderBy(rewardsTable.pointsCost);
    res.json(rewards.map(r => ({
      id: r.id,
      nameAr: r.rewardNameAr,
      pointsCost: r.pointsCost,
      robuxValue: r.robuxValue,
      requiredLevel: r.requiredLevel,
      isLocked: r.isLocked,
      descriptionAr: r.descriptionAr ?? null,
    })));
  } catch (error) {
    console.error("Get rewards error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/redeem", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { rewardId } = req.body;

    const rewards = await db.select().from(rewardsTable).where(eq(rewardsTable.id, rewardId)).limit(1);
    if (!rewards.length) {
      res.status(400).json({ error: "المكافأة غير موجودة" });
      return;
    }

    const reward = rewards[0];
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!users.length) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    const user = users[0];

    if (user.level < reward.requiredLevel) {
      res.status(400).json({ error: `تحتاج للوصول للمستوى ${reward.requiredLevel} لاستبدال هذه المكافأة` });
      return;
    }

    if (user.points < reward.pointsCost) {
      res.status(400).json({ error: "نقاطك غير كافية لاستبدال هذه المكافأة" });
      return;
    }

    const newPoints = user.points - reward.pointsCost;
    await db.update(usersTable)
      .set({
        points: newPoints,
        robuxBalance: Math.floor((newPoints / 1000) * 500),
      })
      .where(eq(usersTable.id, req.userId!));

    await db.insert(redemptionsTable).values({
      userId: req.userId!,
      rewardId: reward.id,
      status: "pending",
    });

    await db.insert(transactionsTable).values({
      userId: req.userId!,
      type: "spend",
      amount: -reward.pointsCost,
      description: `استبدال: ${reward.rewardNameAr} 🎁`,
    });

    res.json({ success: true, message: `تم استبدال ${reward.rewardNameAr} بنجاح! 🎉` });
  } catch (error) {
    console.error("Redeem reward error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
