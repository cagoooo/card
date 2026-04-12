import { useState } from "react";
import { Printer, RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Square = {
  id: number;
  name: string;
  color: string;
  type: "corner" | "property" | "special";
};

const DEFAULT_BOARD: Square[] = Array.from({ length: 40 }).map((_, i) => {
  let type: "corner" | "property" | "special" = "property";
  let name = `地點 ${i}`;
  let color = "#ffffff";

  // Corners
  if (i === 0) { type = "corner"; name = "起點"; color = "#fca5a5"; }
  else if (i === 10) { type = "corner"; name = "監獄"; color = "#cbd5e1"; }
  else if (i === 20) { type = "corner"; name = "免費停車"; color = "#86efac"; }
  else if (i === 30) { type = "corner"; name = "入獄"; color = "#93c5fd"; }
  // Top row properties (1-9)
  else if (i > 0 && i < 10) {
    if (i === 5) { type = "special"; name = "火車站"; }
    else { color = i < 5 ? "#fcd34d" : "#6ee7b7"; name = `台北 ${i}`; }
  }
  // Right col properties (11-19)
  else if (i > 10 && i < 20) {
    if (i === 15) { type = "special"; name = "高鐵站"; }
    else { color = i < 15 ? "#f9a8d4" : "#c4b5fd"; name = `台中 ${i}`; }
  }
  // Bottom row properties (21-29)
  else if (i > 20 && i < 30) {
    if (i === 25) { type = "special"; name = "機場"; }
    else { color = i < 25 ? "#fde047" : "#fdba74"; name = `台南 ${i}`; }
  }
  // Left col properties (31-39)
  else if (i > 30 && i < 40) {
    if (i === 35) { type = "special"; name = "捷運站"; }
    else { color = i < 35 ? "#99f6e4" : "#bae6fd"; name = `高雄 ${i}`; }
  }

  return { id: i, name, color, type };
});

export default function BoardDesigner() {
  const [squares, setSquares] = useState<Square[]>(DEFAULT_BOARD);

  const updateSquare = (id: number, updates: Partial<Square>) => {
    setSquares(squares.map(sq => sq.id === id ? { ...sq, ...updates } : sq));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm("確定要重設為預設值嗎？所有變更將會遺失。")) {
      setSquares(DEFAULT_BOARD);
    }
  };

  // Standard Monopoly board layout (clockwise from GO at bottom-left):
  // Bottom row:  0(GO) → 10(Jail)     left to right
  // Right col:   11 → 19              bottom to top (display top to bottom reversed)
  // Top row:     20(FreePark) → 30(GoJail)  right to left (display left to right reversed)
  // Left col:    31 → 39              top to bottom
  const bottomRow = squares.slice(0, 11); // [0..10], left=0(GO), right=10(Jail)
  const rightCol = [...squares.slice(11, 20)].reverse(); // [19..11], top to bottom
  const topRow = [...squares.slice(20, 31)].reverse(); // [30..20], left=30(GoJail), right=20(FreePark)
  const leftCol = squares.slice(31, 40); // [31..39], top to bottom

  const SquareComponent = ({ sq, className = "" }: { sq: Square; className?: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <div 
          data-testid={`square-${sq.id}`}
          className={`border border-black flex flex-col items-center justify-center text-center p-1 cursor-pointer hover:bg-black/5 transition-colors relative bg-white ${className}`}
        >
          {sq.type === "property" && (
            <div className="absolute top-0 left-0 right-0 h-4 md:h-6 border-b border-black" style={{ backgroundColor: sq.color }} />
          )}
          {sq.type === "corner" && (
            <div className="absolute inset-0 opacity-50" style={{ backgroundColor: sq.color }} />
          )}
          {sq.type === "special" && (
            <div className="absolute top-0 left-0 right-0 h-4 md:h-6 border-b border-black" style={{ backgroundColor: sq.color }} />
          )}
          <span className="text-[10px] md:text-xs font-bold z-10 leading-tight break-all">
            {sq.name}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 z-[100] no-print" data-testid={`popover-square-${sq.id}`}>
        <div className="space-y-4">
          <h4 className="font-bold font-serif">編輯格子</h4>
          <div className="space-y-2">
            <label className="text-sm font-medium">名稱</label>
            <Input 
              value={sq.name} 
              onChange={e => updateSquare(sq.id, { name: e.target.value })}
              data-testid={`input-square-name-${sq.id}`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">顏色</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={sq.color}
                onChange={e => updateSquare(sq.id, { color: e.target.value })}
                className="w-10 h-10 p-1 rounded cursor-pointer"
                data-testid={`input-square-color-${sq.id}`}
              />
              <Input 
                value={sq.color} 
                onChange={e => updateSquare(sq.id, { color: e.target.value })}
                className="flex-1 uppercase font-mono"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="flex-1 bg-secondary/10 flex flex-col">
      <div className="no-print bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">大富翁圖板設計</h1>
          <p className="text-sm text-muted-foreground">點擊格子修改名稱與顏色</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} data-testid="btn-reset-board">
            <RotateCcw className="w-4 h-4 mr-2" /> 重設為預設
          </Button>
          <Button onClick={handlePrint} data-testid="btn-print-board">
            <Printer className="w-4 h-4 mr-2" /> 列印成 PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center">
        <div className="print-board-container bg-white shadow-2xl no-print:rounded-xl">
          {/* Monopoly Board Grid Layout */}
          <div className="w-[800px] h-[800px] border-2 border-black grid grid-cols-[12%_1fr_12%] grid-rows-[12%_1fr_12%]">
            
            {/* Top Row (Jail to Free Parking) */}
            <div className="col-span-3 flex border-b-2 border-black">
              <SquareComponent sq={topRow[0]} className="w-[12%] shrink-0 border-r-2 border-black border-l-0 border-y-0" />
              <div className="flex-1 flex">
                {topRow.slice(1, 10).map(sq => (
                  <SquareComponent key={sq.id} sq={sq} className="flex-1 border-r border-black border-y-0" />
                ))}
              </div>
              <SquareComponent sq={topRow[10]} className="w-[12%] shrink-0 border-l-2 border-black border-r-0 border-y-0" />
            </div>

            {/* Left Column (Row 31-39) */}
            <div className="flex flex-col border-r-2 border-black">
              {leftCol.map(sq => (
                <SquareComponent key={sq.id} sq={sq} className="flex-1 border-b border-black border-x-0" />
              ))}
            </div>

            {/* Center Area */}
            <div className="bg-amber-50/50 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="text-center rotate-[-45deg]">
                <h2 className="text-6xl font-serif font-black tracking-widest text-primary/30">卡牌工坊</h2>
                <p className="text-2xl font-bold text-black/20 mt-4 tracking-widest">地產大亨</p>
              </div>
            </div>

            {/* Right Column (Row 11-19) */}
            <div className="flex flex-col border-l-2 border-black">
              {rightCol.map(sq => (
                <SquareComponent key={sq.id} sq={sq} className="flex-1 border-b border-black border-x-0" />
              ))}
            </div>

            {/* Bottom Row: GO(0) → Jail(10), left to right */}
            <div className="col-span-3 flex border-t-2 border-black">
              <SquareComponent sq={bottomRow[0]} className="w-[12%] shrink-0 border-r-2 border-black border-l-0 border-y-0" />
              <div className="flex-1 flex">
                {bottomRow.slice(1, 10).map(sq => (
                  <SquareComponent key={sq.id} sq={sq} className="flex-1 border-r border-black border-y-0" />
                ))}
              </div>
              <SquareComponent sq={bottomRow[10]} className="w-[12%] shrink-0 border-l-2 border-black border-r-0 border-y-0" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
