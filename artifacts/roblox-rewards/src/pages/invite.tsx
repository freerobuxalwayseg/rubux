import React, { useState } from "react";
import { useGetInviteInfo } from "@workspace/api-client-react";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Users, Copy, CheckCircle2, Share2, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function InvitePage() {
  const { data, isLoading } = useGetInviteInfo();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (data?.inviteLink) {
      navigator.clipboard.writeText(data.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share && data?.inviteLink) {
      navigator.share({
        title: 'انضم إلي في مكافآت روبلوكس!',
        text: 'سجل الآن واحصل على 100,000 نقطة مجانية!',
        url: data.inviteLink,
      });
    } else {
      handleCopy();
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xl font-bold">جاري التحميل...</div>;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full mb-6">
          <Users className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black mb-4">ادعُ أصدقائك واكسب! 🤝</h1>
        <p className="text-xl text-muted-foreground font-medium">
          احصل على <span className="text-accent font-bold">25,000 نقطة</span> عن كل صديق يسجل باستخدام الرابط الخاص بك.
        </p>
      </div>

      {/* Link Section */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border-2 border-primary/30 p-8 rounded-3xl text-center relative overflow-hidden shadow-xl shadow-primary/10"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <h3 className="text-lg font-bold mb-6 text-muted-foreground">الرابط الخاص بك:</h3>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
          <div className="flex-1 bg-secondary w-full p-4 rounded-xl border border-border flex items-center justify-between overflow-hidden group">
            <span className="font-mono text-white truncate text-left dir-ltr select-all">
              {data.inviteLink}
            </span>
            <LinkIcon className="w-5 h-5 text-muted-foreground ml-3 shrink-0" />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handleCopy} size="lg" className="flex-1 sm:w-32" variant={copied ? "gold" : "default"}>
              {copied ? <CheckCircle2 className="w-5 h-5 ml-2" /> : <Copy className="w-5 h-5 ml-2" />}
              {copied ? "تم النسخ" : "نسخ"}
            </Button>
            <Button onClick={handleShare} size="lg" variant="secondary" className="px-4">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground">
          أو كود الدعوة: <span className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-lg ml-2">{data.inviteCode}</span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="text-muted-foreground font-bold mb-1">أصدقاء سجلوا</p>
            <p className="text-3xl font-black">{formatNumber(data.totalInvites)}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-6">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-3xl">⭐</span>
          </div>
          <div>
            <p className="text-muted-foreground font-bold mb-1">نقاط مكتسبة من الدعوات</p>
            <p className="text-3xl font-black text-accent">{formatNumber(data.pointsFromInvites)}</p>
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      {data.nextMilestone && data.nextMilestonePoints && (
        <div className="bg-secondary/30 border border-border p-6 rounded-2xl text-center">
          <h3 className="text-xl font-bold mb-2">المستوى القادم قريباً! 🔥</h3>
          <p className="text-muted-foreground font-medium mb-4">
            ادعُ {data.nextMilestone - data.totalInvites} أصدقاء إضافيين للحصول على مكافأة ضخمة بقيمة <span className="text-accent">{formatNumber(data.nextMilestonePoints)} نقطة</span>!
          </p>
          <div className="w-full max-w-md mx-auto h-4 bg-background rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${(data.totalInvites / data.nextMilestone) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

    </div>
  );
}
