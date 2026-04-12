import type { Suit } from "@/pages/cards";

function cards(values: string[]): Suit["cards"] {
  return values.map((v) => ({
    id: Math.random().toString(36).slice(2),
    value: v,
    description: "",
  }));
}

const STANDARD_VALUES = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

export const CARD_TEMPLATES: Record<string, { name: string; suits: Suit[] }> = {
  standard: {
    name: "🃏 標準撲克牌",
    suits: [
      { id: "s1", name: "黑桃", symbol: "♠", cards: cards(STANDARD_VALUES) },
      { id: "s2", name: "紅心", symbol: "♥", cards: cards(STANDARD_VALUES) },
      { id: "s3", name: "方塊", symbol: "♦", cards: cards(STANDARD_VALUES) },
      { id: "s4", name: "梅花", symbol: "♣", cards: cards(STANDARD_VALUES) },
    ],
  },
  fantasy: {
    name: "⚔️ 奇幻冒險",
    suits: [
      { id: "f1", name: "火焰", symbol: "🔥", cards: cards(["英雄","魔法師","盾衛","弓手","刺客","牧師","巫師","戰士","遊俠","暗影","龍騎","聖騎","死靈"]) },
      { id: "f2", name: "冰霜", symbol: "❄️", cards: cards(["霜龍","冰法","雪妖","極熊","霜甲","寒弓","凍元","冰盾","極狐","霜刃","冰核","凍靈","寒神"]) },
      { id: "f3", name: "雷電", symbol: "⚡", cards: cards(["雷神","閃俠","電刃","弧光","雷鳥","電蛇","閃盾","球電","迅雷","電矛","雷陣","閃痕","天罰"]) },
      { id: "f4", name: "毒藥", symbol: "☠️", cards: cards(["毒蛇","蜘蛛","蠍子","霉菇","病原","酸液","毒刃","蝰毒","腐蝕","暗毒","溶血","梅毒","死毒"]) },
    ],
  },
  chinese: {
    name: "🀄 中文主題",
    suits: [
      { id: "c1", name: "春", symbol: "春", cards: cards(["子鼠","丑牛","寅虎","卯兔","辰龍","巳蛇","午馬","未羊","申猴","酉雞","戌狗","亥豬","玄鳥"]) },
      { id: "c2", name: "夏", symbol: "夏", cards: cards(["甲木","乙木","丙火","丁火","戊土","己土","庚金","辛金","壬水","癸水","陰陽","八卦","太極"]) },
      { id: "c3", name: "秋", symbol: "秋", cards: cards(["雲","風","雷","電","霧","霜","露","雨","雪","冰","虹","月","星"]) },
      { id: "c4", name: "冬", symbol: "冬", cards: cards(["梅","蘭","竹","菊","松","荷","牡丹","桂花","茉莉","玫瑰","薔薇","芍藥","鬱金香"]) },
    ],
  },
  numbers: {
    name: "🔢 教學數字卡",
    suits: [
      { id: "n1", name: "加法", symbol: "➕", cards: cards(["1","2","3","4","5","6","7","8","9","10","11","12","🌟"]) },
      { id: "n2", name: "減法", symbol: "➖", cards: cards(["1","2","3","4","5","6","7","8","9","10","11","12","⭐"]) },
      { id: "n3", name: "乘法", symbol: "✖️", cards: cards(["2×","3×","4×","5×","6×","7×","8×","9×","10×","11×","12×","15×","20×"]) },
      { id: "n4", name: "除法", symbol: "➗", cards: cards(["÷2","÷3","÷4","÷5","÷6","÷8","÷9","÷10","÷12","÷15","÷20","÷25","÷100"]) },
    ],
  },
  colors: {
    name: "🌈 色彩學習",
    suits: [
      { id: "col1", name: "暖色", symbol: "🔴", cards: cards(["紅","橙","黃","粉紅","橘紅","金黃","珊瑚","桃紅","磚紅","銅色","深橙","淡黃","玫紅"]) },
      { id: "col2", name: "冷色", symbol: "🔵", cards: cards(["藍","紫","青","靛藍","天藍","水藍","薰衣草","海軍藍","寶藍","松石綠","薄荷","冰藍","群青"]) },
      { id: "col3", name: "大地", symbol: "🟤", cards: cards(["棕","咖啡","茶色","土黃","栗色","橄欖","沙色","米白","象牙","卡其","焦糖","木色","墨綠"]) },
      { id: "col4", name: "中性", symbol: "⬛", cards: cards(["黑","白","灰","銀","金","米黃","珍珠","象牙","氧化銀","炭黑","霧白","暖灰","冷灰"]) },
    ],
  },
};
