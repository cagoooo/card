import React, { useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

type Card = { id: string; value: string; description: string; imageBase64?: string; };
type Suit = { id: string; name: string; cards: Card[]; };

export function PrintLayout() {
  const [suits] = useLocalStorage<Suit[]>("card-workshop-suits", []);
  const [printSize] = useLocalStorage<string>("card-workshop-print-size", "poker");

  // 解壓縮所有的卡片到一維陣列
  const allCards = useMemo(() => {
    return suits.flatMap((suit) =>
      suit.cards.map((card) => ({ ...card, suitName: suit.name }))
    );
  }, [suits]);

  // 計算每頁張數與排列
  const { cardsPerPage, columns, rows, padding } = useMemo(() => {
    switch (printSize) {
      case "tarot": // 70x121mm
        return { cardsPerPage: 4, columns: 2, rows: 2, padding: "p-[15mm]" };
      case "bridge": // 57x89mm
        return { cardsPerPage: 9, columns: 3, rows: 3, padding: "p-[12mm]" };
      case "poker": // 63x88mm
      default:
        return { cardsPerPage: 9, columns: 3, rows: 3, padding: "p-[10mm]" };
    }
  }, [printSize]);

  // 將一維陣列切成多頁 (每頁 N 張)
  const pages = useMemo(() => {
    const result = [];
    for (let i = 0; i < allCards.length; i += cardsPerPage) {
      result.push(allCards.slice(i, i + cardsPerPage));
    }
    return result;
  }, [allCards, cardsPerPage]);

  const handlePrint = () => {
    window.print();
  };

  if (allCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">沒有發現任何卡牌</h2>
        <Link href="/cards">
          <Button>返回設計工具</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-black">
      {/* 僅在螢幕上顯示的控制列 */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/cards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">精準列印排版模式 (A4)</h1>
            <p className="text-sm text-slate-500">
              共 {allCards.length} 張卡牌 • 分配於 {pages.length} 頁 • 尺寸：{printSize}
            </p>
          </div>
        </div>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          立即列印 (A4)
        </Button>
      </div>

      {/* 排版區 */}
      <div className="p-8 print:p-0 flex flex-col items-center gap-8 print:block print:gap-0">
        {pages.map((pageCards, pageIndex) => (
          <div
            key={pageIndex}
            className={cn(
              "print-sheet size-a4 select-none",
              "flex flex-col items-center justify-center", // 置中對齊
              padding
            )}
          >
            {/* 卡牌網格區域 */}
            <div
              className="grid gap-[8mm] print:gap-[0mm]" // 在列印時，我們可以讓十字線幾乎貼齊 (視需求)，但這裡給一點實體縫隙比較好裁切
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              }}
            >
              {pageCards.map((card, idx) => (
                <div key={`${card.id}-${idx}`} className="relative flex items-center justify-center">
                  
                  {/* 四個裁切線十字架外掛 */}
                  <div className="crop-mark-tl"></div>
                  <div className="crop-mark-tr"></div>
                  <div className="crop-mark-bl"></div>
                  <div className="crop-mark-br"></div>

                  {/* 真正的卡牌內容 */}
                  <div className={`print-card card-size-${printSize} bg-white border-2 border-slate-800 rounded-xl m-1 overflow-hidden relative shadow-sm print:shadow-none print:m-0 print:border-[#bbb]`}>
                    {/* 背景圖 (如果有) */}
                    {card.imageBase64 && (
                      <div className="absolute inset-0 z-0">
                        <img src={card.imageBase64} alt="" className="w-full h-full object-cover opacity-20 filter grayscale" />
                      </div>
                    )}
                    
                    {/* 卡牌內容配置 (相容原先的主題，這裡為了列印統一使用乾淨的高對比樣式) */}
                    <div className="relative z-10 flex flex-col h-full p-3 font-sans">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[1.2rem] font-bold leading-none">{card.value}</span>
                        <span className="text-[0.7rem] px-2 py-0.5 border rounded-full bg-slate-50 text-slate-800 shrink-0">
                          {card.suitName}
                        </span>
                      </div>
                      
                      {/* 若有圖片時的縮圖 */}
                      {card.imageBase64 && (
                        <div className="my-2 border rounded-md overflow-hidden bg-slate-100 flex-1 max-h-[45%] flex items-center justify-center">
                           <img src={card.imageBase64} alt={card.value} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="mt-auto pt-2 border-t text-sm leading-tight text-slate-700 whitespace-pre-wrap">
                        {card.description}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
