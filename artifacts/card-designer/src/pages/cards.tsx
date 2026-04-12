import { useState } from "react";
import { Printer, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Card = {
  id: string;
  value: string;
  description: string;
};

type Suit = {
  id: string;
  name: string;
  symbol: string;
  cards: Card[];
};

const DEFAULT_SUITS: Suit[] = [
  { id: "s1", name: "黑桃", symbol: "♠", cards: generateStandardCards() },
  { id: "s2", name: "紅心", symbol: "♥", cards: generateStandardCards() },
  { id: "s3", name: "方塊", symbol: "♦", cards: generateStandardCards() },
  { id: "s4", name: "梅花", symbol: "♣", cards: generateStandardCards() },
];

function generateStandardCards(): Card[] {
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  return values.map(v => ({ id: Math.random().toString(), value: v, description: "" }));
}

function isRedSuit(symbol: string) {
  return symbol === "♥" || symbol === "♦";
}

type CardPreviewProps = {
  card: Card;
  suit: Suit;
  onEdit?: () => void;
  editable?: boolean;
};

function CardPreview({ card, suit, editable = true }: CardPreviewProps) {
  const red = isRedSuit(suit.symbol);
  const colorClass = red ? "text-red-500" : "text-black";

  return (
    <div
      data-testid={`card-${card.id}`}
      className="print-card aspect-[2.5/3.5] bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group print:rounded-none print:border-gray-400"
      style={{ cursor: editable ? "pointer" : "default" }}
    >
      {/* Crop marks for printing */}
      <div className="hidden print:block absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-400"></div>
      <div className="hidden print:block absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-400"></div>
      <div className="hidden print:block absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-400"></div>
      <div className="hidden print:block absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-400"></div>

      <div className={`absolute top-3 left-3 flex flex-col items-center ${colorClass}`}>
        <span className="text-xl font-bold font-serif leading-none">{card.value}</span>
        <span className="text-lg leading-none mt-1">{suit.symbol}</span>
      </div>

      <div className={`absolute bottom-3 right-3 flex flex-col items-center rotate-180 ${colorClass}`}>
        <span className="text-xl font-bold font-serif leading-none">{card.value}</span>
        <span className="text-lg leading-none mt-1">{suit.symbol}</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-8 text-center flex-col">
        {!card.description && (
          <div className={`text-6xl opacity-20 ${colorClass}`}>
            {suit.symbol}
          </div>
        )}
        {card.description && (
          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{card.description}</p>
        )}
      </div>

      {editable && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity no-print"></div>
      )}
    </div>
  );
}

export default function CardDesigner() {
  const [suits, setSuits] = useState<Suit[]>(DEFAULT_SUITS);
  const [activeSuitId, setActiveSuitId] = useState<string>(DEFAULT_SUITS[0].id);

  const activeSuit = suits.find(s => s.id === activeSuitId) || suits[0];

  const handlePrint = () => {
    window.print();
  };

  const addSuit = () => {
    if (suits.length >= 4) return;
    const newSuit: Suit = { id: Math.random().toString(), name: "新花色", symbol: "🌟", cards: generateStandardCards() };
    setSuits([...suits, newSuit]);
    setActiveSuitId(newSuit.id);
  };

  const updateSuit = (id: string, updates: Partial<Suit>) => {
    setSuits(suits.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSuit = (id: string) => {
    if (suits.length <= 1) return;
    const newSuits = suits.filter(s => s.id !== id);
    setSuits(newSuits);
    if (activeSuitId === id) setActiveSuitId(newSuits[0].id);
  };

  const updateCard = (suitId: string, cardId: string, updates: Partial<Card>) => {
    setSuits(suits.map(s => s.id === suitId ? {
      ...s,
      cards: s.cards.map(c => c.id === cardId ? { ...c, ...updates } : c)
    } : s));
  };

  return (
    <div className="flex-1 bg-secondary/10 flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left Panel - Suits Configuration */}
      <div className="w-full md:w-80 bg-white border-r flex flex-col h-full no-print z-10 shrink-0 shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg">花色設定</h2>
          <Button size="sm" variant="ghost" onClick={addSuit} disabled={suits.length >= 4} data-testid="btn-add-suit">
            <Plus className="w-4 h-4 mr-1" /> 新增
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {suits.map(suit => (
            <div
              key={suit.id}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${activeSuitId === suit.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border bg-muted/50'}`}
              onClick={() => setActiveSuitId(suit.id)}
              data-testid={`suit-item-${suit.id}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={suit.symbol}
                  onChange={e => updateSuit(suit.id, { symbol: e.target.value })}
                  className="w-12 h-10 text-center text-xl p-0 font-serif"
                  maxLength={2}
                  data-testid={`input-suit-symbol-${suit.id}`}
                />
                <Input
                  value={suit.name}
                  onChange={e => updateSuit(suit.id, { name: e.target.value })}
                  className="flex-1 h-10"
                  data-testid={`input-suit-name-${suit.id}`}
                />
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteSuit(suit.id); }} disabled={suits.length <= 1} data-testid={`btn-delete-suit-${suit.id}`}>
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t text-xs text-muted-foreground">
          列印時將輸出全部花色的卡牌
        </div>
      </div>

      {/* Right Panel - Cards Grid (screen: active suit; print: all suits) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-100">
        <div className="no-print bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <span className={isRedSuit(activeSuit.symbol) ? "text-red-500" : "text-black"}>{activeSuit.symbol}</span>
              {activeSuit.name} 卡牌
            </h1>
            <p className="text-sm text-muted-foreground">點擊卡牌編輯內容 — 列印時輸出全部花色</p>
          </div>
          <Button onClick={handlePrint} data-testid="btn-print-cards" className="shadow-sm">
            <Printer className="w-4 h-4 mr-2" /> 列印成 PDF
          </Button>
        </div>

        {/* Screen view: active suit cards with edit dialogs */}
        <div className="no-print flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {activeSuit.cards.map((card) => (
                <Dialog key={card.id}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer">
                      <CardPreview card={card} suit={activeSuit} />
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>編輯卡牌</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">數值 / 標題</label>
                        <Input
                          value={card.value}
                          onChange={e => updateCard(activeSuit.id, card.id, { value: e.target.value })}
                          data-testid={`input-card-value-${card.id}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">描述文字 (選填)</label>
                        <Textarea
                          value={card.description}
                          onChange={e => updateCard(activeSuit.id, card.id, { description: e.target.value })}
                          rows={4}
                          placeholder="輸入卡牌效果或描述..."
                          data-testid={`input-card-desc-${card.id}`}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        </div>

        {/* Print-only view: ALL suits' cards in one grid with fixed physical dimensions */}
        <div className="print-cards-container hidden print:block">
          {suits.map(suit => (
            <div key={suit.id} className="print-suit-section">
              <div className="print-suit-label">{suit.symbol} {suit.name}</div>
              <div className="print-grid">
                {suit.cards.map(card => (
                  <CardPreview key={card.id} card={card} suit={suit} editable={false} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
