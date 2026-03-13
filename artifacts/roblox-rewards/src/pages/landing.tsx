import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const floatingEmojis = ["🎮", "⭐", "🏆", "💎", "🎁", "🚀", "👑", "🌟", "💰", "🎯", "🔥", "✨"];

const steps = [
  { emoji: "📝", title: "سجّل حسابك", desc: "إنشاء حساب مجاني في ثوانٍ واحصل على 100,000 نقطة ترحيبية فوراً!", color: "from-blue-500 to-purple-600" },
  { emoji: "👥", title: "ادعُ أصدقاءك", desc: "شارك رابط دعوتك الخاص مع أصدقائك واحصل على 25,000 نقطة عن كل صديق!", color: "from-primary to-orange-500" },
  { emoji: "⭐", title: "اجمع النقاط", desc: "كلما دعوت أكثر، كسبت أكثر! صعّد مستوياتك وافتح مكافآت حصرية نادرة!", color: "from-yellow-500 to-amber-600" },
  { emoji: "💰", title: "اسحب أرباحك", desc: "حوّل نقاطك إلى روبلكس وقم بسحبها عبر فيزا أو فودافون أو أورنج أو WE كاش!", color: "from-green-500 to-emerald-600" },
];

const rewards = [
  { robux: "400", points: "100,000", emoji: "🎮", color: "bg-blue-500/20 border-blue-500/30 text-blue-400" },
  { robux: "800", points: "200,000", emoji: "💎", color: "bg-purple-500/20 border-purple-500/30 text-purple-400" },
  { robux: "1700", points: "400,000", emoji: "👑", color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" },
];

const levels = [
  { level: 1, emoji: "🥉", invites: 0, label: "المبتدئ" },
  { level: 3, emoji: "🥈", invites: 5, label: "الناشط" },
  { level: 5, emoji: "🥇", invites: 20, label: "الخبير" },
  { level: 7, emoji: "💎", invites: 50, label: "الأسطورة" },
  { level: 10, emoji: "👑", invites: 150, label: "بطل المنصة" },
];

const fakeLeaderboard = [
  { rank: 1, name: "أحمد🔥", invites: 120, emoji: "🥇" },
  { rank: 2, name: "سارة⭐", invites: 87, emoji: "🥈" },
  { rank: 3, name: "محمد💎", invites: 63, emoji: "🥉" },
  { rank: 4, name: "فاطمة🌟", invites: 45, emoji: "4️⃣" },
  { rank: 5, name: "عمر🚀", invites: 32, emoji: "5️⃣" },
];

export default function LandingPage() {
  const [floaters, setFloaters] = useState<{ emoji: string; x: number; delay: number; size: number }[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setFloaters(
      Array.from({ length: 15 }, (_, i) => ({
        emoji: floatingEmojis[i % floatingEmojis.length],
        x: Math.random() * 100,
        delay: Math.random() * 5,
        size: 1.5 + Math.random() * 2,
      }))
    );

    const interval = setInterval(() => {
      setCount(c => (c < 48923 ? c + Math.floor(Math.random() * 120) + 50 : 48923));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir="rtl">

      {/* Floating background emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {floaters.map((f, i) => (
          <div
            key={i}
            className="absolute animate-bounce opacity-10"
            style={{
              left: `${f.x}%`,
              fontSize: `${f.size}rem`,
              animationDelay: `${f.delay}s`,
              animationDuration: `${3 + f.delay}s`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {f.emoji}
          </div>
        ))}
      </div>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />

        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-8xl mb-6"
        >
          🎮
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-black mb-4 leading-tight"
        >
          <span className="bg-gradient-to-l from-primary via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            منصة مكافآت
          </span>
          <br />
          <span className="text-white">روبلوكس العربية 🚀</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl md:text-2xl text-muted-foreground font-bold max-w-2xl mb-4"
        >
          ادعُ أصدقاءك، اجمع النقاط، واستبدلها بـ <span className="text-yellow-400">روبلكس حقيقية! 💰</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-muted-foreground mb-10 text-lg"
        >
          انضم إلى <span className="text-primary font-black text-2xl">{count.toLocaleString("ar-EG")}</span> لاعب عربي الآن!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/auth">
            <button className="px-10 py-5 bg-gradient-to-l from-primary to-orange-500 text-white text-2xl font-black rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 hover:shadow-primary/60 transition-all duration-200 active:scale-95">
              🚀 ابدأ الآن مجاناً!
            </button>
          </Link>
          <a href="#how-it-works">
            <button className="px-10 py-5 bg-white/10 border-2 border-white/20 text-white text-xl font-bold rounded-2xl hover:bg-white/20 transition-all duration-200">
              🎯 كيف يعمل؟
            </button>
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-6 mt-16"
        >
          {[
            { val: "100,000", label: "نقطة مكافأة ترحيبية", emoji: "🎁" },
            { val: "25,000", label: "نقطة عن كل دعوة", emoji: "👥" },
            { val: "5,000", label: "نقطة يومية مجانية", emoji: "⭐" },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
              <div className="text-3xl mb-1">{s.emoji}</div>
              <div className="text-2xl font-black text-primary">{s.val}</div>
              <div className="text-sm text-muted-foreground font-bold">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
            كيف تكسب الروبلكس؟ 🎯
          </h2>
          <p className="text-center text-muted-foreground text-xl mb-16">أربع خطوات بسيطة للبدء!</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden hover:scale-105 transition-transform duration-300"
              >
                <div className={cn("absolute top-0 left-0 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br", step.color)} style={{ transform: "translate(-30%, -30%)" }} />
                <div className="text-6xl mb-4">{step.emoji}</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm bg-gradient-to-br", step.color)}>
                    {i + 1}
                  </div>
                  <h3 className="text-2xl font-black">{step.title}</h3>
                </div>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REWARDS */}
      <section className="py-20 px-4 bg-secondary/20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">🎁 المكافآت المتاحة</h2>
          <p className="text-muted-foreground text-xl mb-12">استبدل نقاطك بروبلكس حقيقية في أي وقت!</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rewards.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={cn("border-2 rounded-3xl p-8 hover:scale-105 transition-transform duration-300", r.color)}
              >
                <div className="text-7xl mb-4">{r.emoji}</div>
                <div className="text-4xl font-black mb-2">{r.robux} R$</div>
                <div className="text-lg font-bold opacity-80">{r.points} نقطة</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LEVELS */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">⭐ نظام المستويات</h2>
          <p className="text-center text-muted-foreground text-xl mb-12">كلما دعوت أكثر، ارتقيت أعلى!</p>
          <div className="space-y-3">
            {levels.map((lv, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/50 transition-colors"
              >
                <span className="text-4xl">{lv.emoji}</span>
                <div className="flex-1">
                  <div className="font-black text-xl">المستوى {lv.level} — {lv.label}</div>
                  <div className="text-muted-foreground font-bold">{lv.invites > 0 ? `${lv.invites} دعوة للوصول` : "مستوى البداية"}</div>
                </div>
                <div className="bg-primary/10 text-primary font-black px-4 py-2 rounded-xl">
                  LV {lv.level}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERBOARD PREVIEW */}
      <section className="py-20 px-4 bg-secondary/20 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">🏆 المتصدرون</h2>
          <p className="text-muted-foreground text-xl mb-10">من سيكون في القمة هذا الأسبوع؟</p>
          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            {fakeLeaderboard.map((entry, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 border-b border-border/50 last:border-0",
                  i === 0 && "bg-yellow-500/10",
                  i === 1 && "bg-gray-400/10",
                  i === 2 && "bg-amber-600/10"
                )}
              >
                <span className="text-2xl">{entry.emoji}</span>
                <span className="font-black text-lg flex-1 text-right">{entry.name}</span>
                <span className="font-bold text-muted-foreground">{entry.invites} دعوة</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-muted-foreground">هل اسمك يمكن أن يكون هنا؟ 👆</p>
        </div>
      </section>

      {/* PAYMENT METHODS */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">💳 طرق السحب المتاحة</h2>
          <p className="text-muted-foreground text-xl mb-12">اسحب أرباحك بأي طريقة تناسبك!</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { emoji: "💳", name: "فيزا / ماستركارد", color: "border-blue-500/40 bg-blue-500/10" },
              { emoji: "📱", name: "فودافون كاش", color: "border-red-500/40 bg-red-500/10" },
              { emoji: "🟠", name: "أورنج كاش", color: "border-orange-500/40 bg-orange-500/10" },
              { emoji: "📡", name: "اتصالات كاش", color: "border-green-500/40 bg-green-500/10" },
              { emoji: "🔮", name: "WE كاش", color: "border-violet-500/40 bg-violet-500/10" },
            ].map((pm, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn("border-2 rounded-2xl p-6 flex flex-col items-center gap-3 hover:scale-105 transition-transform", pm.color)}
              >
                <span className="text-4xl">{pm.emoji}</span>
                <span className="font-bold text-sm">{pm.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative z-10 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary/20 to-orange-500/10 border-2 border-primary/30 rounded-[3rem] p-12">
          <div className="text-7xl mb-6">🚀</div>
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            جاهز للبدء؟
          </h2>
          <p className="text-xl text-muted-foreground mb-10 font-bold">
            انضم الآن واحصل على <span className="text-yellow-400 text-2xl font-black">100,000 نقطة</span> مجاناً!
          </p>
          <Link href="/auth">
            <button className="px-12 py-6 bg-gradient-to-l from-primary to-orange-500 text-white text-2xl font-black rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 hover:shadow-primary/60 transition-all duration-200 active:scale-95 inline-block">
              🎮 سجّل الآن مجاناً!
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border text-center text-muted-foreground relative z-10">
        <p className="font-bold">🎮 منصة مكافآت روبلوكس العربية · جميع الحقوق محفوظة 2026</p>
      </footer>
    </div>
  );
}
