import React from "react";
import { useAuth } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";
import { User, Mail, ShieldCheck, Trophy, Star, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const BADGES_LIST = [
  { id: 1, name: 'أول خطوة', icon: '🌟', min: 1 },
  { id: 2, name: 'ناشط اجتماعي', icon: '🤝', min: 5 },
  { id: 3, name: 'داعية النجوم', icon: '⭐', min: 10 },
  { id: 4, name: 'أسطورة الدعوات', icon: '👑', min: 25 },
  { id: 5, name: 'بطل المنصة', icon: '🏆', min: 50 }
];

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const earnedBadges = BADGES_LIST.filter(b => user.totalInvites >= b.min);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header Card */}
      <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-gradient-to-br from-primary to-orange-500 rounded-3xl p-1 shadow-2xl rotate-3">
            <div className="w-full h-full bg-card rounded-[1.4rem] flex items-center justify-center">
              <User className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          <div className="text-center md:text-right flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-black">{user.username}</h1>
              {user.isVerified && <ShieldCheck className="w-6 h-6 text-success" title="حساب موثق" />}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground font-medium mb-4">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border px-4 py-2 rounded-xl text-sm font-bold">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              انضم في: {user.createdAt ? format(new Date(user.createdAt), 'MMM yyyy', { locale: ar }) : 'حديثاً'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl text-center">
          <p className="text-muted-foreground font-bold mb-2">المستوى الحالي</p>
          <div className="text-5xl font-black text-primary drop-shadow-md mb-2">{user.level}</div>
          <p className="text-sm font-medium">سوبر ستار ✨</p>
        </div>
        
        <div className="bg-card border border-border p-6 rounded-3xl text-center">
          <p className="text-muted-foreground font-bold mb-2">النقاط الكلية</p>
          <div className="text-4xl font-black text-accent drop-shadow-md mb-2 flex items-center justify-center gap-2">
            {formatNumber(user.points)} <Star className="w-6 h-6 fill-current" />
          </div>
        </div>
        
        <div className="bg-card border border-border p-6 rounded-3xl text-center">
          <p className="text-muted-foreground font-bold mb-2">دعوات ناجحة</p>
          <div className="text-4xl font-black text-blue-400 drop-shadow-md mb-2 flex items-center justify-center gap-2">
            {formatNumber(user.totalInvites)}
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-card border border-border rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-black">الشارات المكتسبة</h2>
        </div>
        
        {earnedBadges.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 font-bold">لم تكتسب أي شارات بعد. ابدأ بدعوة الأصدقاء!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {BADGES_LIST.map((badge) => {
              const isEarned = user.totalInvites >= badge.min;
              return (
                <div key={badge.id} className={cn(
                  "p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all",
                  isEarned ? "bg-secondary border-primary/30 shadow-lg shadow-primary/5" : "bg-background/50 border-border opacity-40 grayscale"
                )}>
                  <span className="text-4xl mb-3 drop-shadow-md">{badge.icon}</span>
                  <span className="font-bold text-sm">{badge.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
