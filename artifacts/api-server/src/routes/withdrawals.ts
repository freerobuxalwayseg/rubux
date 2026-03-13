import { Router } from "express";
import { db } from "@workspace/db";
import { withdrawalsTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const router = Router();

const MIN_ROBUX = 1000;

router.post("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { amountRobux, paymentMethod, paymentDetails } = req.body;

    if (!amountRobux || !paymentMethod || !paymentDetails) {
      res.status(400).json({ error: "جميع الحقول مطلوبة" });
      return;
    }

    if (amountRobux < MIN_ROBUX) {
      res.status(400).json({ error: `الحد الأدنى للسحب ${MIN_ROBUX.toLocaleString()} روبلكس` });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!users.length) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    const user = users[0];

    if (amountRobux > user.robuxBalance) {
      res.status(400).json({ error: "رصيدك من الروبلكس غير كافٍ" });
      return;
    }

    // Check account age (at least 7 days)
    const accountAge = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (accountAge < 7) {
      res.status(400).json({ error: "يجب أن يكون حسابك عمره 7 أيام على الأقل للسحب" });
      return;
    }

    const newRobuxBalance = user.robuxBalance - amountRobux;
    const pointsDeducted = Math.floor((amountRobux / 500) * 1000);
    const newPoints = user.points - pointsDeducted;

    await db.update(usersTable)
      .set({
        robuxBalance: newRobuxBalance,
        points: Math.max(0, newPoints),
      })
      .where(eq(usersTable.id, req.userId!));

    await db.insert(withdrawalsTable).values({
      userId: req.userId!,
      amountRobux,
      paymentMethod,
      paymentDetailsEncrypted: Buffer.from(paymentDetails).toString("base64"),
      status: "pending",
    });

    await db.insert(transactionsTable).values({
      userId: req.userId!,
      type: "withdraw",
      amount: -amountRobux,
      description: `سحب ${amountRobux.toLocaleString()} روبلكس 💸`,
    });

    res.json({ success: true, message: "تم إرسال طلب السحب بنجاح! سيتم المعالجة خلال 2-3 أيام 🎉" });
  } catch (error) {
    console.error("Create withdrawal error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const withdrawals = await db.select()
      .from(withdrawalsTable)
      .where(eq(withdrawalsTable.userId, req.userId!))
      .orderBy(desc(withdrawalsTable.requestedAt))
      .limit(20);

    res.json(withdrawals.map(w => ({
      id: w.id,
      amountRobux: w.amountRobux,
      paymentMethod: w.paymentMethod,
      status: w.status,
      rejectionReason: w.rejectionReason ?? null,
      requestedAt: w.requestedAt.toISOString(),
      processedAt: w.processedAt?.toISOString() ?? null,
    })));
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
