import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Printer, Plus, Trash2, Download, Upload, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import imageCompression from "browser-image-compression";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { CARD_TEMPLATES } from "@/lib/card-templates";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Card = {
  id: string;
  value: string;
  description: string;
  imageBase64?: string;
};

export type Suit = {
  id: string;
  name: string;
  symbol: string;
  cards: Card[];
};

const PRINT_SIZES = {
  poker:  { width: "63mm",  height: "88mm",  label: "撲克牌 63×88mm" },
  bridge: { width: "57mm",  height: "89mm",  label: "橋牌 57×89mm" },
  tarot:  { width: "70mm",  height: "121mm", label: "塔羅牌 70×121mm" },
} as const;
type PrintSize = keyof typeof PRINT_SIZES;

// ─── Card visual themes ───────────────────────────────────────────────────────
const CARD_THEMES = {
  classic:  { name: "📝 經典白",    bg: "#ffffff", border: "#e5e7eb", borderWidth: "1px", text: "#111827", accent: "#374151", radius: "0.75rem" },
  fantasy:  { name: "⚔️ 奇幻羊皮", bg: "linear-gradient(135deg,#fdf6e3,#f5deb3)", border: "#92400e", borderWidth: "2px", text: "#3b1a08", accent: "#92400e", radius: "0.5rem" },
  scifi:    { name: "🚀 科幻霓虹",  bg: "linear-gradient(135deg,#0d1117,#0d2137)", border: "#22d3ee", borderWidth: "2px", text: "#e0f2fe", accent: "#22d3ee", radius: "0.25rem" },
  chinese:  { name: "🀄 水墨風",    bg: "#f9f4ea", border: "#292524", borderWidth: "2px", text: "#1c1917", accent: "#7c2d12", radius: "0" },
  wood:     { name: "🌲 木板質感",  bg: "linear-gradient(135deg,#a0522d,#8B6914)", border: "#451a03", borderWidth: "2px", text: "#fef3c7", accent: "#fde68a", radius: "0.5rem" },
} as const;
type CardTheme = keyof typeof CARD_THEMES;

// ─── Default data ─────────────────────────────────────────────────────────────
function genCards(values: string[]): Card[] {
  return values.map((v) => ({ id: Math.random().toString(36).slice(2), value: v, description: "" }));
}
const STD = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const DEFAULT_SUITS: Suit[] = [
  { id: "ds1", name: "黑桃", symbol: "♠", cards: genCards(STD) },
  { id: "ds2", name: "紅心", symbol: "♥", cards: genCards(STD) },
  { id: "ds3", name: "方塊", symbol: "♦", cards: genCards(STD) },
  { id: "ds4", name: "梅花", symbol: "♣", cards: genCards(STD) },
];

function isRedSuit(symbol: string) { return ["♥","♦","❤️","🔴"].includes(symbol); }

// ─── Sortable suit item ───────────────────────────────────────────────────────
function SortableSuit({
  suit, isActive, isStudent, onSelect, onUpdate, onDelete, canDelete,
}: {
  suit: Suit; isActive: boolean; isStudent: boolean;
  onSelect: () => void;
  onUpdate: (change: Partial<Suit>) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: suit.id });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef} style={style} {...attributes}
      className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
        isActive ? "border-primary bg-primary/5" : "border-transparent hover:border-border bg-muted/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 mb-2">
        {!isStudent && (
          <div {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground" onClick={(e) => e.stopPropagation()}>
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <Input
          value={suit.symbol}
          maxLength={2}
          readOnly={isStudent}
          className="w-12 text-center font-bold text-lg p-1 h-8"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ symbol: e.target.value })}
        />
        <Input
          value={suit.name}
          readOnly={isStudent}
          className="flex-1 h-8 text-sm"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        {!isStudent && canDelete && (
          <Button
            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground pl-6">{suit.cards.length} 張卡牌</p>
    </div>
  );
}

// ─── Card preview ─────────────────────────────────────────────────────────────
function CardPreview({ card, suit, theme }: { card: Card; suit: Suit; theme: CardTheme }) {
  const t = CARD_THEMES[theme];
  const red = isRedSuit(suit.symbol);
  const cardStyle: React.CSSProperties = {
    background: t.bg,
    border: `${t.borderWidth} solid ${t.border}`,
    borderRadius: t.radius,
    color: t.text,
  };

  return (
    <div
      className="print-card relative select-none overflow-hidden"
      style={{ width: "63mm", height: "88mm", ...cardStyle }}
      data-testid={`card-preview-${card.id}`}
    >
      {/* Top-left corner */}
      <div className="absolute top-1.5 left-2 flex flex-col items-center leading-none">
        <span className="text-sm font-black">{card.value}</span>
        <span className="text-xs" style={{ color: red ? "#dc2626" : t.accent }}>{suit.symbol}</span>
      </div>
      {/* Top-right corner (flipped) */}
      <div className="absolute top-1.5 right-2 flex flex-col items-center leading-none rotate-180">
        <span className="text-sm font-black">{card.value}</span>
        <span className="text-xs" style={{ color: red ? "#dc2626" : t.accent }}>{suit.symbol}</span>
      </div>

      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {card.imageBase64 ? (
          <img src={card.imageBase64} alt="card art" className="max-w-[80%] max-h-[60%] object-contain" />
        ) : card.description ? (
          <p className="text-xs text-center px-4 leading-relaxed opacity-80">{card.description}</p>
        ) : (
          <span className="text-5xl" style={{ color: red ? "#dc2626" : t.accent, opacity: 0.25 }}>{suit.symbol}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Designer ────────────────────────────────────────────────────────────
export default function CardDesigner() {
  const [suits,         setSuits]         = useLocalStorage<Suit[]>("card-workshop-suits",       DEFAULT_SUITS);
  const [activeSuitId,  setActiveSuitId]  = useLocalStorage<string>("card-workshop-active-suit", DEFAULT_SUITS[0].id);
  const [cardTheme,     setCardTheme]     = useLocalStorage<CardTheme>("card-workshop-card-theme", "classic");
  const [printSize,     setPrintSize]     = useLocalStorage<PrintSize>("card-workshop-print-size", "poker");
  const [editingCard,   setEditingCard]   = useState<Card | null>(null);
  const [editingSuitId, setEditingSuitId] = useState<string>("");
  const [uploading,     setUploading]     = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const isStudent = searchParams.get("mode") === "student";

  // Apply CSS variables for print size
  useEffect(() => {
    const s = PRINT_SIZES[printSize];
    document.documentElement.style.setProperty("--card-print-width",  s.width);
    document.documentElement.style.setProperty("--card-print-height", s.height);
  }, [printSize]);

  const activeSuit = suits.find((s) => s.id === activeSuitId) ?? suits[0];

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSuits((items) =>
        arrayMove(items, items.findIndex((s) => s.id === active.id), items.findIndex((s) => s.id === over.id))
      );
    }
  };

  // Suit helpers
  const updateSuit  = (id: string, change: Partial<Suit>) => setSuits(suits.map((s) => (s.id === id ? { ...s, ...change } : s)));
  const deleteSuit  = (id: string) => {
    const next = suits.filter((s) => s.id !== id);
    setSuits(next);
    if (activeSuitId === id) setActiveSuitId(next[0]?.id ?? "");
  };
  const addSuit = () => {
    if (suits.length >= 4) return;
    const id = crypto.randomUUID();
    setSuits([...suits, { id, name: "新花色", symbol: "★", cards: genCards(STD) }]);
    setActiveSuitId(id);
  };

  // Card helpers
  const updateCard = (suitId: string, cardId: string, change: Partial<Card>) =>
    setSuits(suits.map((s) => s.id === suitId
      ? { ...s, cards: s.cards.map((c) => (c.id === cardId ? { ...c, ...change } : c)) }
      : s));
  const addCard    = (suitId: string) => {
    setSuits(suits.map((s) => s.id === suitId
      ? { ...s, cards: [...s.cards, { id: crypto.randomUUID(), value: `卡${s.cards.length + 1}`, description: "" }] }
      : s));
  };
  const removeCard = (suitId: string) => {
    setSuits(suits.map((s) => s.id === suitId && s.cards.length > 1 ? { ...s, cards: s.cards.slice(0, -1) } : s));
  };

  // Template apply
  const applyTemplate = (key: string) => {
    const tpl = CARD_TEMPLATES[key];
    if (!tpl) return;
    if (confirm(`套用「${tpl.name}」將覆蓋目前設計，確定嗎？`)) {
      const newSuits = tpl.suits.map((s) => ({ ...s, cards: s.cards.map((c) => ({ ...c, id: crypto.randomUUID() })) }));
      setSuits(newSuits);
      setActiveSuitId(newSuits[0].id);
    }
  };

  // JSON Export / Import
  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ version: "1.0", type: "cards", exportedAt: new Date().toISOString(), data: { suits } }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a   = Object.assign(document.createElement("a"), { href: url, download: `卡牌工坊-卡牌-${Date.now()}.json` });
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
        if (parsed.type !== "cards" || !Array.isArray(parsed.data?.suits)) throw new Error();
        if (confirm("確定要載入此設計？目前的卡牌將被覆蓋。")) {
          setSuits(parsed.data.suits);
          setActiveSuitId(parsed.data.suits[0]?.id ?? "");
        }
      } catch { alert("❌ 檔案格式錯誤，請確認是卡牌工坊匯出的卡牌檔案。"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCard) return;
    setUploading(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.15, maxWidthOrHeight: 350, useWebWorker: true });
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        updateCard(editingSuitId, editingCard.id, { imageBase64: base64 });
        setEditingCard({ ...editingCard, imageBase64: base64 });
      };
      reader.readAsDataURL(compressed);
    } catch { alert("圖片處理失敗，請嘗試更小的圖片。"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* LEFT: Suit panel */}
      <div className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r flex flex-col no-print">
        {/* Template selector */}
        {!isStudent && (
          <>
            <div className="p-3 border-b">
              <label className="text-xs text-muted-foreground mb-1 block">快速套用模板</label>
              <Select onValueChange={applyTemplate}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="選擇模板..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CARD_TEMPLATES).map(([k, t]) => (
                    <SelectItem key={k} value={k}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Visual theme */}
            <div className="p-3 border-b">
              <label className="text-xs text-muted-foreground mb-1 block">卡牌視覺主題</label>
              <Select value={cardTheme} onValueChange={(v) => setCardTheme(v as CardTheme)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CARD_THEMES) as CardTheme[]).map((k) => (
                    <SelectItem key={k} value={k}>{CARD_THEMES[k].name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Print size */}
            <div className="p-3 border-b">
              <label className="text-xs text-muted-foreground mb-1 block">列印尺寸</label>
              <Select value={printSize} onValueChange={(v) => setPrintSize(v as PrintSize)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRINT_SIZES) as PrintSize[]).map((k) => (
                    <SelectItem key={k} value={k}>{PRINT_SIZES[k].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Suit list with DnD */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={suits.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {suits.map((suit) => (
                <SortableSuit
                  key={suit.id}
                  suit={suit}
                  isActive={suit.id === activeSuitId}
                  isStudent={isStudent}
                  onSelect={() => setActiveSuitId(suit.id)}
                  onUpdate={(change) => updateSuit(suit.id, change)}
                  onDelete={() => deleteSuit(suit.id)}
                  canDelete={suits.length > 1}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Add suit */}
        {!isStudent && suits.length < 4 && (
          <div className="p-3 border-t">
            <Button variant="outline" size="sm" className="w-full" onClick={addSuit}>
              <Plus className="w-4 h-4 mr-1" /> 新增花色
            </Button>
          </div>
        )}

        {/* Card count controls */}
        {!isStudent && (
          <div className="p-3 border-t flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => addCard(activeSuit?.id ?? "")}>
              <Plus className="w-3 h-3 mr-1" /> 新增卡牌
            </Button>
            <Button size="sm" variant="outline" onClick={() => removeCard(activeSuit?.id ?? "")}
              disabled={!activeSuit || activeSuit.cards.length <= 1}>
              <Trash2 className="w-3 h-3 mr-1" /> 移除最後
            </Button>
          </div>
        )}
      </div>

      {/* RIGHT: Card grid */}
      <div className="flex-1 flex flex-col bg-secondary/10">
        {/* Toolbar */}
        <div className="no-print bg-white border-b px-4 py-3 flex flex-wrap items-center gap-2">
          <div className="flex-1">
            <h1 className="text-xl font-serif font-bold">卡牌設計工具</h1>
            <p className="text-xs text-muted-foreground">點擊卡牌編輯內容</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" /> 匯出
          </Button>
          <label>
            <Button variant="outline" size="sm" asChild>
              <span><Upload className="w-4 h-4 mr-1" /> 匯入</span>
            </Button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <Button size="sm" onClick={() => setLocation("/cards/print")}>
            <Printer className="w-4 h-4 mr-1" /> 進階列印排版 (A4)
          </Button>
        </div>

        {/* Cards grid */}
        <div className="flex-1 overflow-auto p-4">
          {activeSuit && (
            <>
              <h2 className="font-serif font-bold text-lg mb-4 no-print">
                {activeSuit.symbol} {activeSuit.name}
                <span className="text-sm font-normal text-muted-foreground ml-2">（{activeSuit.cards.length} 張）</span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {activeSuit.cards.map((card) => (
                  <button
                    key={card.id}
                    className="no-print hover:scale-105 transition-transform"
                    onClick={() => { setEditingCard(card); setEditingSuitId(activeSuit.id); }}
                  >
                    <CardPreview card={card} suit={activeSuit} theme={cardTheme} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Print layout (hidden on screen) */}
        <div className="print-only">
          {suits.map((suit) => (
            <div key={suit.id} className="print-suit-section">
              <div className="flex flex-wrap">
                {suit.cards.map((card) => (
                  <div key={card.id} className="p-1">
                    <CardPreview card={card} suit={suit} theme={cardTheme} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      {editingCard && (
        <Dialog open onOpenChange={(open) => { if (!open) setEditingCard(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">編輯卡牌</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">數值 / 標題</label>
                <Input
                  value={editingCard.value}
                  onChange={(e) => {
                    const c = { ...editingCard, value: e.target.value };
                    setEditingCard(c);
                    updateCard(editingSuitId, editingCard.id, { value: e.target.value });
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">描述文字（中央顯示）</label>
                <Textarea
                  rows={4}
                  value={editingCard.description}
                  onChange={(e) => {
                    const c = { ...editingCard, description: e.target.value };
                    setEditingCard(c);
                    updateCard(editingSuitId, editingCard.id, { description: e.target.value });
                  }}
                  placeholder="輸入卡牌說明文字（選填）"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">卡牌插圖</label>
                {editingCard.imageBase64 && (
                  <div className="mb-2 relative">
                    <img src={editingCard.imageBase64} alt="插圖" className="w-24 h-32 object-contain rounded border mx-auto block" />
                    <Button
                      variant="ghost" size="sm" className="mt-1 text-destructive w-full"
                      onClick={() => {
                        updateCard(editingSuitId, editingCard.id, { imageBase64: undefined });
                        setEditingCard({ ...editingCard, imageBase64: undefined });
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> 移除圖片
                    </Button>
                  </div>
                )}
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" className="w-full" asChild disabled={uploading}>
                    <span>{uploading ? "壓縮中…" : "📷 上傳圖片"}</span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                <p className="text-xs text-muted-foreground mt-1">自動壓縮至 150KB，建議使用方形圖片。若有描述文字，圖片優先顯示。</p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">預覽（目前主題：{CARD_THEMES[cardTheme].name}）</p>
                <div className="mt-2 flex justify-center">
                  <div className="scale-75 origin-top">
                    <CardPreview card={editingCard} suit={activeSuit ?? suits[0]} theme={cardTheme} />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
