import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, withdrawalsTable, transactionsTable } from "@workspace/db";
import { eq, desc, sql, count, sum } from "drizzle-orm";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const router = Router();
const ADMIN_EMAIL = "yoseif.muhamed@gmail.com";

async function requireAdmin(req: AuthenticatedRequest, res: any, next: any) {
  const users = await db.select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!))
    .limit(1);
  if (!users.length || users[0].email !== ADMIN_EMAIL) {
    res.status(403).json({ error: "غير مصرح لك بالوصول" });
    return;
  }
  next();
}

router.get("/stats", authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const [totalUsers] = await db.select({ count: count() }).from(usersTable);
    const [totalWithdrawals] = await db.select({ count: count() }).from(withdrawalsTable);
    const [pendingWithdrawals] = await db.select({ count: count() }).from(withdrawalsTable)
      .where(eq(withdrawalsTable.status, "pending"));
    const [totalRobuxWithdrawn] = await db.select({ total: sum(withdrawalsTable.amountRobux) })
      .from(withdrawalsTable)
      .where(eq(withdrawalsTable.status, "completed"));
    const [totalPointsEarned] = await db.select({ total: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(sql`${transactionsTable.type} IN ('earn', 'invite_bonus', 'daily_reward')`);
    const topInviters = await db.select({
      username: usersTable.username,
      email: usersTable.email,
      totalInvites: usersTable.totalInvites,
      points: usersTable.points,
      level: usersTable.level,
    })
      .from(usersTable)
      .orderBy(desc(usersTable.totalInvites))
      .limit(5);

    const recentUsers = await db.select({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      points: usersTable.points,
      level: usersTable.level,
      totalInvites: usersTable.totalInvites,
      createdAt: usersTable.createdAt,
    })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(10);

    res.json({
      totalUsers: totalUsers.count,
      totalWithdrawals: totalWithdrawals.count,
      pendingWithdrawals: pendingWithdrawals.count,
      totalRobuxWithdrawn: Number(totalRobuxWithdrawn.total ?? 0),
      totalPointsEarned: Number(totalPointsEarned.total ?? 0),
      topInviters,
      recentUsers: recentUsers.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.get("/withdrawals", authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const withdrawals = await db
      .select({
        id: withdrawalsTable.id,
        amountRobux: withdrawalsTable.amountRobux,
        paymentMethod: withdrawalsTable.paymentMethod,
        paymentDetailsEncrypted: withdrawalsTable.paymentDetailsEncrypted,
        status: withdrawalsTable.status,
        rejectionReason: withdrawalsTable.rejectionReason,
        requestedAt: withdrawalsTable.requestedAt,
        processedAt: withdrawalsTable.processedAt,
        username: usersTable.username,
        email: usersTable.email,
      })
      .from(withdrawalsTable)
      .leftJoin(usersTable, eq(withdrawalsTable.userId, usersTable.id))
      .orderBy(desc(withdrawalsTable.requestedAt))
      .limit(100);

    res.json(withdrawals.map(w => ({
      id: w.id,
      amountRobux: w.amountRobux,
      paymentMethod: w.paymentMethod,
      paymentDetails: Buffer.from(w.paymentDetailsEncrypted ?? "", "base64").toString("utf-8"),
      status: w.status,
      rejectionReason: w.rejectionReason ?? null,
      requestedAt: w.requestedAt.toISOString(),
      processedAt: w.processedAt?.toISOString() ?? null,
      username: w.username ?? "—",
      email: w.email ?? "—",
    })));
  } catch (error) {
    console.error("Admin withdrawals error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.patch("/withdrawals/:id", authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    await db.update(withdrawalsTable)
      .set({
        status,
        rejectionReason: rejectionReason ?? null,
        processedAt: ["completed", "rejected"].includes(status) ? new Date() : null,
      })
      .where(eq(withdrawalsTable.id, parseInt(id)));

    res.json({ success: true, message: "تم تحديث الحالة" });
  } catch (error) {
    console.error("Update withdrawal error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
