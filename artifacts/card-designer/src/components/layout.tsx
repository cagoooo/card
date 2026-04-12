import { Link } from "wouter";
import { Palette, Layers } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="no-print border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-xl">
              卡
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">卡牌工坊</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/board" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-board">
              <Layers className="w-4 h-4" />
              圖板設計
            </Link>
            <Link href="/cards" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-cards">
              <Palette className="w-4 h-4" />
              卡牌設計
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
