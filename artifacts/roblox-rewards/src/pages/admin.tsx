import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { formatNumber, cn } from "@/lib/utils";
import { Users, TrendingUp, Wallet, Clock, CheckCircle2, XCircle, RefreshCw, BarChart3, LogOut } from "lucide-react";
import { useLogout } from "@workspace/api-client-react";

const ADMIN_EMAIL = "yoseif.muhamed@gmail.com";

interface Stats {
  totalUsers: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  totalRobuxWithdrawn: number;
  totalPointsEarned: number;
  topInviters: { username: string; email: string; totalInvites: number; points: number; level: number }[];
  recentUsers: { id: number; username: string; email: string; points: number; level: number; totalInvites: number; createdAt: string }[];
}

interface Withdrawal {
  id: number;
  amountRobux: number;
  paymentMethod: string;
  paymentDetails: string;
  status: string;
  rejectionReason: string | null;
  requestedAt: string;
  processedAt: string | null;
  username: string;
  email: string;
}

const METHOD_LABELS: Record<string, string> = {
  visa: "💳 فيزا",
  vodafone: "📱 فودافون",
  orange: "🟠 أورنج",
  etisalat: "📡 اتصالات / WE",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "⏳ معلّق", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  processing: { label: "🔄 قيد المعالجة", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  completed: { label: "✅ مكتمل", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  rejected: { label: "❌ مرفوض", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function AdminPage() {
  const { user, logout } = useAuth();
  const logoutMut = useLogout();
  const [stats, setStats] = useState<Stats | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stats" | "withdrawals" | "users">("stats");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, wdRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/withdrawals"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (wdRes.ok) setWithdrawals(await wdRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) fetchData();
  }, [user]);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchData();
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user) return null;
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground" dir="rtl">
        <div className="text-center">
          <div className="text-7xl mb-4">🚫</div>
          <h1 className="text-3xl font-black mb-2">غير مصرح</h1>
          <p className="text-muted-foreground">هذه الصفحة متاحة للمشرف فقط</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "stats", label: "الإحصائيات", emoji: "📊" },
    { id: "withdrawals", label: "طلبات السحب", emoji: "💸" },
    { id: "users", label: "المستخدمون", emoji: "👥" },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center font-black text-white text-xl">⚙️</div>
            <div>
              <div className="font-black text-lg">لوحة التحكم</div>
              <div className="text-xs text-muted-foreground">منصة مكافآت روبلوكس</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-secondary hover:bg-border transition-colors"
              title="تحديث"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => logoutMut.mutate(undefined, { onSettled: logout })}
              className="p-2 rounded-lg bg-secondary hover:bg-destructive/20 hover:text-destructive transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-secondary/40 p-1.5 rounded-2xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl font-bold transition-all text-sm",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32 text-2xl font-bold text-muted-foreground">
            جاري التحميل...
          </div>
        ) : (
          <>
            {/* STATS TAB */}
            {activeTab === "stats" && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Users, label: "إجمالي المستخدمين", val: formatNumber(stats.totalUsers), color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { icon: Wallet, label: "طلبات السحب", val: formatNumber(stats.totalWithdrawals), color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
                    { icon: Clock, label: "طلبات معلّقة", val: formatNumber(stats.pendingWithdrawals), color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
                    { icon: TrendingUp, label: "روبلكس تم سحبها", val: formatNumber(stats.totalRobuxWithdrawn), color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                  ].map((s, i) => (
                    <div key={i} className={cn("border-2 rounded-2xl p-6", s.bg)}>
                      <s.icon className={cn("w-8 h-8 mb-3", s.color)} />
                      <div className="text-3xl font-black mb-1">{s.val}</div>
                      <div className="text-sm text-muted-foreground font-bold">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Top Inviters */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-secondary/30">
                    <h3 className="font-black text-xl">🏆 أكثر المدعوين</h3>
                  </div>
                  <div className="divide-y divide-border/50">
                    {stats.topInviters.map((u, i) => (
                      <div key={i} className="px-6 py-4 flex items-center gap-4">
                        <span className="text-2xl">{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</span>
                        <div className="flex-1">
                          <div className="font-bold">{u.username}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-primary">{u.totalInvites} دعوة</div>
                          <div className="text-xs text-muted-foreground">مستوى {u.level}</div>
                        </div>
                      </div>
                    ))}
                    {stats.topInviters.length === 0 && (
                      <div className="px-6 py-8 text-center text-muted-foreground">لا يوجد بيانات بعد</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* WITHDRAWALS TAB */}
            {activeTab === "withdrawals" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-black">جميع طلبات السحب ({withdrawals.length})</h2>
                  <div className="flex gap-2 text-sm">
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <span key={k} className={cn("px-3 py-1 rounded-full border font-bold text-xs", v.color)}>
                        {v.label}
                      </span>
                    ))}
                  </div>
                </div>

                {withdrawals.length === 0 ? (
                  <div className="bg-card border border-border rounded-3xl p-16 text-center text-muted-foreground font-bold text-xl">
                    لا توجد طلبات سحب حتى الآن
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-secondary/40 border-b border-border">
                          <tr>
                            {["#", "المستخدم", "المبلغ", "طريقة الدفع", "بيانات الحساب", "الحالة", "التاريخ", "إجراء"].map(h => (
                              <th key={h} className="px-4 py-3 text-right text-sm font-black text-muted-foreground">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {withdrawals.map((w) => {
                            const st = STATUS_LABELS[w.status] ?? { label: w.status, color: "" };
                            return (
                              <tr key={w.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-4 py-4 text-muted-foreground font-mono text-sm">#{w.id}</td>
                                <td className="px-4 py-4">
                                  <div className="font-bold">{w.username}</div>
                                  <div className="text-xs text-muted-foreground">{w.email}</div>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="font-black text-green-400 text-lg">{formatNumber(w.amountRobux)}</span>
                                  <span className="text-xs text-muted-foreground mr-1">R$</span>
                                </td>
                                <td className="px-4 py-4 font-bold">{METHOD_LABELS[w.paymentMethod] ?? w.paymentMethod}</td>
                                <td className="px-4 py-4">
                                  <div className="bg-secondary/50 rounded-lg px-3 py-2 font-mono text-sm dir-ltr max-w-[180px] truncate" title={w.paymentDetails}>
                                    {w.paymentDetails}
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <span className={cn("px-3 py-1 rounded-full border text-xs font-black whitespace-nowrap", st.color)}>
                                    {st.label}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(w.requestedAt).toLocaleDateString("ar-EG")}
                                  <br />
                                  {new Date(w.requestedAt).toLocaleTimeString("ar-EG")}
                                </td>
                                <td className="px-4 py-4">
                                  {w.status === "pending" || w.status === "processing" ? (
                                    <div className="flex gap-2">
                                      <button
                                        disabled={updatingId === w.id}
                                        onClick={() => updateStatus(w.id, "completed")}
                                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/40 transition-colors disabled:opacity-50"
                                        title="موافقة"
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        disabled={updatingId === w.id}
                                        onClick={() => updateStatus(w.id, "rejected")}
                                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors disabled:opacity-50"
                                        title="رفض"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && stats && (
              <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-secondary/30">
                  <h3 className="font-black text-xl">👥 آخر المسجلين</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/20 border-b border-border">
                      <tr>
                        {["#", "المستخدم", "البريد", "النقاط", "المستوى", "الدعوات", "تاريخ التسجيل"].map(h => (
                          <th key={h} className="px-4 py-3 text-right text-sm font-black text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {stats.recentUsers.map((u, i) => (
                        <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-4 text-muted-foreground font-mono text-sm">{i + 1}</td>
                          <td className="px-4 py-4 font-bold">{u.username}</td>
                          <td className="px-4 py-4 text-sm text-muted-foreground dir-ltr">{u.email}</td>
                          <td className="px-4 py-4 font-black text-primary">{formatNumber(u.points)}</td>
                          <td className="px-4 py-4">
                            <span className="bg-primary/10 text-primary font-bold px-2 py-1 rounded-lg text-sm">LV {u.level}</span>
                          </td>
                          <td className="px-4 py-4 font-bold text-center">{u.totalInvites}</td>
                          <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
