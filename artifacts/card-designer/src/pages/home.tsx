import { Link } from "wouter";
import { ArrowRight, Layers, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-xl shadow-primary/20 rotate-3">
          <span className="font-serif font-bold text-5xl">卡</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground">
          打造你的專屬桌遊
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          卡牌工坊是一個充滿創意的工具，讓你輕鬆設計自訂的大富翁圖板與專屬撲克牌，並匯出成 PDF 在家列印。
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link href="/board" data-testid="link-hero-board">
            <div className="group relative overflow-hidden rounded-3xl border bg-card p-8 hover:shadow-lg transition-all hover:-translate-y-1 text-left cursor-pointer h-full flex flex-col">
              <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-2">圖板設計工具</h2>
              <p className="text-muted-foreground mb-8 flex-1">
                設計經典的 40 格環狀遊戲圖板，自訂每個地點的名稱與顏色，創造屬於你的地產大亨。
              </p>
              <div className="flex items-center text-primary font-bold group-hover:gap-3 transition-all gap-2">
                開始設計 <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>

          <Link href="/cards" data-testid="link-hero-cards">
            <div className="group relative overflow-hidden rounded-3xl border bg-card p-8 hover:shadow-lg transition-all hover:-translate-y-1 text-left cursor-pointer h-full flex flex-col">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-2">卡牌設計工具</h2>
              <p className="text-muted-foreground mb-8 flex-1">
                設計自訂的撲克牌牌組。建立你的專屬花色、圖案，並填寫卡牌效果，打造獨一無二的遊戲體驗。
              </p>
              <div className="flex items-center text-primary font-bold group-hover:gap-3 transition-all gap-2">
                開始設計 <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
