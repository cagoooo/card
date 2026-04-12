import { useState, useRef } from "react";
import { Printer, RotateCcw, Download, Upload, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/use-local-storage";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Square = {
  id: number;
  name: string;
  color: string;
  type: "corner" | "property" | "special";
  icon?: string;
};

export type BoardSize = 20 | 32 | 40 | 52;
const BOARD_SIZES: BoardSize[] = [20, 32, 40, 52];

// ─── Emoji quick-pick ─────────────────────────────────────────────────────────
const QUICK_EMOJIS = [
  "🏠","🚉","✈️","🚓","🏦","🏪","⭐","💰","🎲","🎯",
  "🏆","💎","🗺️","🌊","🏔️","🌋","🎪","🎭","🎠","🚗",
];

// ─── Board generation ─────────────────────────────────────────────────────────
function generateBoard(count: BoardSize): Square[] {
  const sideLen = (count - 4) / 4;
  const C0 = 0;
  const C1 = sideLen + 1;
  const C2 = sideLen * 2 + 2;
  const C3 = sideLen * 3 + 3;
  const corners: Record<number, { name: string; color: string }> = {
    [C0]: { name: "起點",     color: "#fca5a5" },
    [C1]: { name: "監獄",     color: "#cbd5e1" },
    [C2]: { name: "免費停車", color: "#86efac" },
    [C3]: { name: "入獄",     color: "#93c5fd" },
  };
  const propColors = ["#fcd34d","#6ee7b7","#f9a8d4","#c4b5fd","#fde047","#fdba74","#99f6e4","#bae6fd"];
  const cityNames  = ["台北","台中","台南","高雄"];
  const specials   = ["火車站","高鐵站","機場","捷運站"];
  const mid = Math.floor(sideLen / 2);

  return Array.from({ length: count }).map((_, i) => {
    if (i in corners) {
      return { id: i, type: "corner" as const, color: corners[i].color, name: corners[i].name };
    }
    let side = 0;
    let pos  = 0;
    if      (i <= C1)         { side = 0; pos = i - 1; }
    else if (i <= C2 - 1)     { side = 1; pos = i - (C1 + 1); }
    else if (i <= C3)         { side = 2; pos = i - (C2 + 1); }
    else                      { side = 3; pos = i - (C3 + 1); }

    if (pos === mid) {
      return { id: i, type: "special" as const, name: specials[side], color: "#e5e7eb" };
    }
    const colorIdx = (side * 2 + (pos < mid ? 0 : 1)) % propColors.length;
    return { id: i, type: "property" as const, name: `${cityNames[side]} ${pos + 1}`, color: propColors[colorIdx] };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BoardDesigner() {
  const [squares,   setSquares]   = useLocalStorage<Square[]>("card-workshop-board",      generateBoard(40));
  const [boardSize, setBoardSize] = useLocalStorage<BoardSize>("card-workshop-board-size", 40);
  const [scale,     setScale]     = useState(1);
  const importRef = useRef<HTMLInputElement>(null);

  const updateSquare = (id: number, updates: Partial<Square>) =>
    setSquares(squares.map((sq) => (sq.id === id ? { ...sq, ...updates } : sq)));

  const handleReset = () => {
    if (confirm("確定要重設為預設值嗎？所有變更將會遺失。")) {
      setSquares(generateBoard(boardSize));
    }
  };

  const handleChangeBoardSize = (val: string) => {
    const size = Number(val) as BoardSize;
    if (confirm(`切換為 ${size} 格圖板，目前設計將被清除，確定嗎？`)) {
      setBoardSize(size);
      setSquares(generateBoard(size));
    }
  };

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ version: "1.0", type: "board", exportedAt: new Date().toISOString(), boardSize, data: { squares } }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a   = Object.assign(document.createElement("a"), { href: url, download: `卡牌工坊-圖板-${Date.now()}.json` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.type !== "board" || !Array.isArray(parsed.data?.squares)) throw new Error();
        if (confirm("確定要載入此設計？目前的圖板將被覆蓋。")) {
          setSquares(parsed.data.squares);
          if (parsed.boardSize) setBoardSize(parsed.boardSize as BoardSize);
        }
      } catch { alert("❌ 檔案格式錯誤，請確認是卡牌工坊匯出的圖板檔案。"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      setScale((s) => Math.min(1.5, Math.max(0.4, +(s + (e.deltaY > 0 ? -0.1 : 0.1)).toFixed(1))));
    }
  };

  // Board layout slicing (generic for any size)
  const sideLen   = (boardSize - 4) / 4;
  const C1        = sideLen + 1;
  const C2        = sideLen * 2 + 2;
  const C3        = sideLen * 3 + 3;
  const bottomRow = squares.slice(0, C1 + 1);
  const rightCol  = [...squares.slice(C1 + 1, C2)].reverse();
  const topRow    = [...squares.slice(C2, C3 + 1)].reverse();
  const leftCol   = squares.slice(C3 + 1);

  // ─── Square cell component ────────────────────────────────────────────────
  const SquareCell = ({ sq, className = "" }: { sq: Square; className?: string }) => (
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
          <div className="z-10 flex flex-col items-center gap-0.5 leading-tight">
            {sq.icon && <span className="text-base leading-none">{sq.icon}</span>}
            <span className="text-[9px] md:text-[11px] font-bold break-all">{sq.name}</span>
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-72 z-[100] no-print" data-testid={`popover-square-${sq.id}`}>
        <div className="space-y-4">
          <h4 className="font-bold font-serif">編輯格子</h4>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">名稱</label>
            <Input value={sq.name} onChange={(e) => updateSquare(sq.id, { name: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">顏色</label>
            <div className="flex gap-2">
              <input
                type="color" value={sq.color}
                onChange={(e) => updateSquare(sq.id, { color: e.target.value })}
                className="w-10 h-10 p-1 rounded cursor-pointer border border-input"
              />
              <Input
                value={sq.color}
                onChange={(e) => updateSquare(sq.id, { color: e.target.value })}
                className="flex-1 uppercase font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">圖標 Emoji（選填）</label>
            <Input
              value={sq.icon ?? ""}
              onChange={(e) => updateSquare(sq.id, { icon: e.target.value || undefined })}
              placeholder="輸入 Emoji 或留空"
              maxLength={4}
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji} type="button"
                  className="text-base hover:scale-125 transition-transform leading-none"
                  onClick={() => updateSquare(sq.id, { icon: emoji })}
                >
                  {emoji}
                </button>
              ))}
              {sq.icon && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive ml-auto"
                  onClick={() => updateSquare(sq.id, { icon: undefined })}
                >
                  ✕ 清除
                </button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-secondary/10 flex flex-col">
      {/* Toolbar */}
      <div className="no-print bg-white border-b px-4 py-3 flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-serif font-bold">大富翁圖板設計</h1>
          <p className="text-xs text-muted-foreground">點擊格子修改名稱、顏色與圖標</p>
        </div>

        {/* Grid size selector */}
        <Select value={String(boardSize)} onValueChange={handleChangeBoardSize}>
          <SelectTrigger className="w-28 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {BOARD_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>{s} 格圖板</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 border rounded-md px-1.5 py-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setScale((s) => Math.max(0.4, +(s - 0.1).toFixed(1)))}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-mono w-10 text-center select-none">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setScale((s) => Math.min(1.5, +(s + 0.1).toFixed(1)))}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="重置縮放"
            onClick={() => setScale(1)}>
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Action buttons */}
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1" /> 匯出
        </Button>
        <label>
          <Button variant="outline" size="sm" asChild>
            <span><Upload className="w-4 h-4 mr-1" /> 匯入</span>
          </Button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
        <Button variant="outline" size="sm" onClick={handleReset} data-testid="btn-reset-board">
          <RotateCcw className="w-4 h-4 mr-1" /> 重設
        </Button>
        <Button size="sm" onClick={() => window.print()} data-testid="btn-print-board">
          <Printer className="w-4 h-4 mr-1" /> 列印
        </Button>
      </div>

      {/* Board canvas */}
      <div
        className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center"
        onWheel={handleWheel}
      >
        <motion.div
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ transformOrigin: "top center" }}
          className="print-board-container bg-white shadow-2xl no-print:rounded-xl"
        >
          <div
            className="w-[800px] h-[800px] border-2 border-black grid"
            style={{ gridTemplateColumns: "12% 1fr 12%", gridTemplateRows: "12% 1fr 12%" }}
          >
            {/* Top row */}
            <div className="col-span-3 flex border-b-2 border-black">
              <SquareCell sq={topRow[0]}  className="w-[12%] shrink-0 border-r-2 border-black border-l-0 border-y-0" />
              <div className="flex-1 flex">
                {topRow.slice(1, topRow.length - 1).map((sq) => (
                  <SquareCell key={sq.id} sq={sq} className="flex-1 border-r border-black border-y-0" />
                ))}
              </div>
              <SquareCell sq={topRow[topRow.length - 1]} className="w-[12%] shrink-0 border-l-2 border-black border-r-0 border-y-0" />
            </div>

            {/* Left col */}
            <div className="flex flex-col border-r-2 border-black">
              {leftCol.map((sq) => <SquareCell key={sq.id} sq={sq} className="flex-1 border-b border-black border-x-0" />)}
            </div>

            {/* Center */}
            <div className="bg-amber-50/50 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(#000 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="text-center rotate-[-45deg]">
                <h2 className="text-6xl font-serif font-black tracking-widest text-primary/30">卡牌工坊</h2>
                <p className="text-2xl font-bold text-black/20 mt-4 tracking-widest">地產大亨</p>
              </div>
            </div>

            {/* Right col */}
            <div className="flex flex-col border-l-2 border-black">
              {rightCol.map((sq) => <SquareCell key={sq.id} sq={sq} className="flex-1 border-b border-black border-x-0" />)}
            </div>

            {/* Bottom row */}
            <div className="col-span-3 flex border-t-2 border-black">
              <SquareCell sq={bottomRow[0]} className="w-[12%] shrink-0 border-r-2 border-black border-l-0 border-y-0" />
              <div className="flex-1 flex">
                {bottomRow.slice(1, bottomRow.length - 1).map((sq) => (
                  <SquareCell key={sq.id} sq={sq} className="flex-1 border-r border-black border-y-0" />
                ))}
              </div>
              <SquareCell sq={bottomRow[bottomRow.length - 1]} className="w-[12%] shrink-0 border-l-2 border-black border-r-0 border-y-0" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
