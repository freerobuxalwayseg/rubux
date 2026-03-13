import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { formatNumber, cn } from "@/lib/utils";
import { 
  Home, Users, Gift, Diamond, Trophy, Coins, User as UserIcon, 
  LogOut, Menu, X, Star
} from "lucide-react";
import { useLogout } from "@workspace/api-client-react";

const navLinks = [
  { href: "/dashboard", label: "الرئيسية", icon: Home, emoji: "🏠" },
  { href: "/invite", label: "دعوة أصدقاء", icon: Users, emoji: "👥" },
  { href: "/rewards", label: "المكافآت", icon: Gift, emoji: "🎁" },
  { href: "/levels", label: "المستويات", icon: Star, emoji: "⭐" },
  { href: "/rare-items", label: "عناصر نادرة", icon: Diamond, emoji: "💎" },
  { href: "/leaderboard", label: "المتصدرون", icon: Trophy, emoji: "🏆" },
  { href: "/earnings", label: "أرباحي", icon: Coins, emoji: "💰" },
  { href: "/profile", label: "حسابي", icon: UserIcon, emoji: "👤" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const logoutMut = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMut.mutate(undefined, {
      onSettled: () => {
        logout();
      }
    });
  };

  // No layout wrapper for public pages or admin (has its own header)
  if (!user || location === "/admin") return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden" dir="rtl">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* Right side - Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all shadow-lg shadow-primary/20">
                <span className="text-xl font-black text-white">R</span>
              </div>
              <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-l from-white to-gray-400 hidden sm:inline-block">
                روبلوكس <span className="text-primary">مكافآت</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2",
                    location === link.href 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span>{link.emoji}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Left side - Points & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-secondary/50 rounded-2xl border border-border/50">
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground font-semibold">رصيد النقاط</span>
                <span className="font-black text-accent text-shadow-glow flex items-center gap-1">
                  {formatNumber(user.points)} <Star className="w-4 h-4 fill-accent" />
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-secondary/50 hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-colors text-muted-foreground"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <button 
              className="lg:hidden w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-md pt-24 px-4 overflow-y-auto pb-10">
          <div className="flex flex-col gap-2">
            <div className="p-4 bg-secondary/50 rounded-2xl mb-4 border border-border flex justify-between items-center">
              <span className="font-bold">رصيدك الحالي:</span>
              <span className="font-black text-accent flex items-center gap-1 text-lg">
                {formatNumber(user.points)} ⭐
              </span>
            </div>
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "p-4 rounded-2xl text-lg font-bold transition-all flex items-center gap-3",
                  location === link.href 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-secondary/40 text-foreground hover:bg-secondary"
                )}
              >
                <span className="text-2xl">{link.emoji}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
