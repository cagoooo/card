import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/use-local-storage";

// ─── Types ────────────────────────────────────────────────────────────────────
export type CardBack = {
  backgroundColor: string;
  pattern: "none" | "dots" | "grid" | "diagonal" | "crosshatch";
  patternColor: string;
  centerText: string;
  centerTextColor: string;
  borderColor: string;
  borderWidth: number;
};

const DEFAULT_CARD_BACK: CardBack = {
  backgroundColor: "#1a237e",
  pattern: "dots",
  patternColor: "rgba(255,255,255,0.15)",
  centerText: "卡牌工坊",
  centerTextColor: "#ffffff",
  borderColor: "#8B0000",
  borderWidth: 4,
};

const PATTERNS: Record<CardBack["pattern"], { name: string; label: string }> = {
  none:       { name: "無花紋",   label: "無" },
  dots:       { name: "點陣",     label: "●●●" },
  grid:       { name: "格子",     label: "▦▦▦" },
  diagonal:   { name: "斜線",     label: "╱╱╱" },
  crosshatch: { name: "交叉線",   label: "╳╳╳" },
};

// ─── Pattern background style ─────────────────────────────────────────────────
function getPatternStyle(pattern: CardBack["pattern"], color: string): React.CSSProperties {
  switch (pattern) {
    case "dots":
      return { backgroundImage: `radial-gradient(circle, ${color} 2px, transparent 2px)`, backgroundSize: "14px 14px" };
    case "grid":
      return {
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      };
    case "diagonal":
      return { backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 12px)` };
    case "crosshatch":
      return { backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 10px), repeating-linear-gradient(-45deg, ${color}, ${color} 1px, transparent 1px, transparent 10px)` };
    default:
      return {};
  }
}

// ─── Back Preview Card ────────────────────────────────────────────────────────
function BackPreview({ back, compact = false }: { back: CardBack; compact?: boolean }) {
  const size = compact
    ? { width: "63px", height: "88px" }
    : { width: "126px", height: "176px" };

  const patternStyle = getPatternStyle(back.pattern, back.patternColor);

  return (
    <div
      className="relative overflow-hidden select-none print-card-back"
      style={{
        ...size,
        backgroundColor: back.backgroundColor,
        border: `${back.borderWidth}px solid ${back.borderColor}`,
        borderRadius: "8px",
        ...patternStyle,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-2">
          <p
            className="font-serif font-bold leading-tight break-all"
            style={{ color: back.centerTextColor, fontSize: compact ? "8px" : "14px" }}
          >
            {back.centerText}
          </p>
        </div>
      </div>
      {/* Inner border frame */}
      <div
        className="absolute inset-[6px] border rounded"
        style={{ borderColor: `${back.borderColor}80` }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CardBackDesigner() {
  const [back, setBack] = useLocalStorage<CardBack>("card-workshop-card-back", DEFAULT_CARD_BACK);

  const update = (change: Partial<CardBack>) => setBack({ ...back, ...change });

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-secondary/10">
      {/* Left: Controls */}
      <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r flex flex-col no-print">
        <div className="p-5 border-b">
          <h1 className="text-xl font-serif font-bold">卡牌背面設計</h1>
          <p className="text-xs text-muted-foreground mt-0.5">設計所有卡牌共用的背面</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Background color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">底色</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={back.backgroundColor}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="w-10 h-10 rounded border border-input cursor-pointer p-0.5"
              />
              <Input
                value={back.backgroundColor}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="flex-1 uppercase font-mono text-xs"
              />
            </div>
          </div>

          {/* Pattern */}
          <div className="space-y-2">
            <label className="text-sm font-medium">花紋</label>
            <Select value={back.pattern} onValueChange={(v) => update({ pattern: v as CardBack["pattern"] })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(PATTERNS) as [CardBack["pattern"], { name: string; label: string }][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}　{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pattern color */}
          {back.pattern !== "none" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">花紋顏色</label>
              <Input
                value={back.patternColor}
                onChange={(e) => update({ patternColor: e.target.value })}
                placeholder="rgba(255,255,255,0.15)"
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">支援 rgba() 格式，可調整透明度</p>
            </div>
          )}

          {/* Center text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">中央文字</label>
            <Input
              value={back.centerText}
              onChange={(e) => update({ centerText: e.target.value })}
              placeholder="例：卡牌工坊"
            />
          </div>

          {/* Center text color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">文字顏色</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={back.centerTextColor}
                onChange={(e) => update({ centerTextColor: e.target.value })}
                className="w-10 h-10 rounded border border-input cursor-pointer p-0.5"
              />
              <Input
                value={back.centerTextColor}
                onChange={(e) => update({ centerTextColor: e.target.value })}
                className="flex-1 uppercase font-mono text-xs"
              />
            </div>
          </div>

          {/* Border color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">邊框顏色</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={back.borderColor}
                onChange={(e) => update({ borderColor: e.target.value })}
                className="w-10 h-10 rounded border border-input cursor-pointer p-0.5"
              />
              <Input
                value={back.borderColor}
                onChange={(e) => update({ borderColor: e.target.value })}
                className="flex-1 uppercase font-mono text-xs"
              />
            </div>
          </div>

          {/* Border width */}
          <div className="space-y-2">
            <label className="text-sm font-medium">邊框寬度：{back.borderWidth}px</label>
            <input
              type="range" min={1} max={12} value={back.borderWidth}
              onChange={(e) => update({ borderWidth: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          {/* Reset */}
          <Button variant="outline" size="sm" className="w-full"
            onClick={() => { if (confirm("重設為預設卡背？")) setBack(DEFAULT_CARD_BACK); }}>
            重設為預設
          </Button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4 no-print">卡背預覽（實際尺寸的 2×）</p>
          <BackPreview back={back} />
        </div>

        {/* Print area */}
        <div className="print-only grid gap-1" style={{ gridTemplateColumns: "repeat(auto-fill, 63mm)" }}>
          {Array.from({ length: 13 }).map((_, i) => (
            <BackPreview key={i} back={back} compact />
          ))}
        </div>

        <Button
          size="lg"
          className="no-print gap-2 shadow-lg"
          onClick={() => window.print()}
        >
          <Printer className="w-5 h-5" />
          列印卡背（13 張 / 頁）
        </Button>
      </div>
    </div>
  );
}
