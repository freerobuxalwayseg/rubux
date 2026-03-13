import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const router = Router();

const INVITE_MILESTONES = [
  { invites: 5, points: 50000 },
  { invites: 10, points: 100000 },
  { invites: 25, points: 250000 },
  { invites: 50, points: 500000 },
  { invites: 100, points: 1000000 },
];

router.get("/generate", authMiddleware, async (req: AuthenticatedRequest, res) => {
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
    const baseUrl = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "https://roblox-rewards.replit.app";
    const inviteLink = `${baseUrl}/?ref=${user.inviteCode}`;
    const pointsFromInvites = user.totalInvites * 25000;

    const nextMilestone = INVITE_MILESTONES.find(m => m.invites > user.totalInvites);

    res.json({
      inviteCode: user.inviteCode,
      inviteLink,
      totalInvites: user.totalInvites,
      pointsFromInvites,
      nextMilestone: nextMilestone?.invites ?? null,
      nextMilestonePoints: nextMilestone?.points ?? null,
    });
  } catch (error) {
    console.error("Get invite info error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
