import { Link, useLocation } from "wouter";
import { Palette, Layers, FolderOpen, FlipHorizontal2 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/board",      icon: Layers,         label: "圖板設計",  testId: "link-nav-board"     },
  { href: "/cards",      icon: Palette,        label: "卡牌設計",  testId: "link-nav-cards"     },
  { href: "/cards/back", icon: FlipHorizontal2, label: "卡背設計", testId: "link-nav-card-back" },
  { href: "/projects",   icon: FolderOpen,     label: "我的專案",  testId: "link-nav-projects"  },
] as const;

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const isStudent = searchParams.get("mode") === "student";

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="no-print border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-xl">
              卡
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">卡牌工坊 {isStudent && <span className="text-xs ml-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full">學生作業模式</span>}</span>
          </Link>

          {/* Nav */}
          {!isStudent && (
            <nav className="hidden sm:flex items-center gap-1 text-sm font-medium">
              {NAV_ITEMS.map(({ href, icon: Icon, label, testId }) => {
                const active = location.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    data-testid={testId}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Mobile nav (小螢幕顯示圖示) */}
          {!isStudent && (
            <nav className="flex sm:hidden items-center gap-1">
              {NAV_ITEMS.map(({ href, icon: Icon, testId }) => {
                const active = location.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    data-testid={`mobile-${testId}`}
                    className={`p-2 rounded-lg transition-colors ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
