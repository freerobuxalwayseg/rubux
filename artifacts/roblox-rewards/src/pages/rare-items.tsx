import React from "react";
import { useAuth } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";

// Mock data as requested since API doesn't specify rare items endpoint explicitly
const RARE_ITEMS = [
  { id: 1, name: "خوذة المحارب الذهبية", invitesReq: 10, image: "warrior-helmet.png", desc: "خوذة نادرة جداً للمحاربين الشجعان." },
  { id: 2, name: "قبعة دومينوس الأسطورية", invitesReq: 20, image: "dominus-hat.png", desc: "القطعة الأكثر رغبة في اللعبة. مرعبة وقوية." },
  { id: 3, name: "درع النيون الخرافي", invitesReq: 35, image: "legend-armor.png", desc: "درع يضيء في الظلام ويعطيك قوة خارقة." },
];

export default function RareItemsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-l from-purple-400 to-pink-600">
          عناصر نادرة وحصرية 💎
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          ادعُ المزيد من الأصدقاء لفتح قفل هذه العناصر الخرافية داخل اللعبة!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {RARE_ITEMS.map((item) => {
          const isUnlocked = user.totalInvites >= item.invitesReq;
          const progress = Math.min(100, (user.totalInvites / item.invitesReq) * 100);

          return (
            <div key={item.id} className="bg-card rounded-[2rem] p-1 border-2 border-border relative group overflow-hidden">
              {/* Animated Border gradient if unlocked */}
              {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-50 animate-[spin_4s_linear_infinite] -z-10 blur-xl"></div>
              )}
              
              <div className="bg-card h-full rounded-[1.8rem] p-6 relative z-10 flex flex-col">
                <div className="absolute top-4 left-4 z-20">
                  {isUnlocked ? (
                    <div className="bg-purple-500/20 text-purple-400 p-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-purple-500/30">
                      <Unlock className="w-4 h-4" /> مفتوح
                    </div>
                  ) : (
                    <div className="bg-background/80 backdrop-blur text-muted-foreground p-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-border">
                      <Lock className="w-4 h-4" /> مقفل
                    </div>
                  )}
                </div>

                <div className="h-48 flex items-center justify-center relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-2xl"></div>
                  <img 
                    src={`${import.meta.env.BASE_URL}images/${item.image}`} 
                    alt={item.name} 
                    className={`w-32 h-32 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-500 ${!isUnlocked && 'grayscale opacity-50'}`}
                  />
                </div>

                <h3 className="text-2xl font-black mb-2">{item.name}</h3>
                <p className="text-muted-foreground text-sm font-medium mb-6 h-10">{item.desc}</p>

                <div className="mt-auto">
                  {!isUnlocked ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span>التقدم:</span>
                        <span className="text-purple-400">{user.totalInvites} / {item.invitesReq} دعوة</span>
                      </div>
                      <div className="w-full h-3 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 text-white shadow-purple-500/25">
                      استلم العنصر الآن! 🎮
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
