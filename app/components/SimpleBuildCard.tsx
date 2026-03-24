"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingCart, Sword } from "lucide-react";

// Hardcoded core items for demo
const CORE_ITEMS: Record<number, number[]> = {
  61: [3078, 3153, 3071], // Orianna - Trinity, BotRK, Cleaver (not accurate, demo)
  268: [3115, 3089, 3135], // Azir
  112: [3157, 3041, 3089], // Viktor
  84: [4633, 3102, 3157], // Akali
  7: [3152, 3100, 3135], // LeBlanc - Rocketbelt, LB, Void
  157: [6673, 3046, 1018], // Yasuo - Shieldbow, Phantom Dancer
};

const ITEM_NAMES: Record<number, string> = {
  6673: "Immortal Shieldbow",
  3046: "Phantom Dancer",
  1018: "Cloak of Agility",
  3078: "Trinity Force",
  3153: "Blade of The Ruined King",
  3071: "Black Cleaver",
  3115: "Nashor's Tooth",
  3089: "Rabadon's Deathcap",
  3135: "Void Staff",
  3157: "Zhonya's Hourglass",
  3041: "Mejai's Soulstealer",
  4633: "Riftmaker",
  3102: "Banshee's Veil",
  3152: "Hextech Rocketbelt",
  3100: "Lich Bane",
};

const ITEM_ICONS: Record<number, string> = {
  6673: "6672", // Shieldbow (uses 6672 icon)
  3046: "3046",
  1018: "1018",
  3078: "3078",
  3153: "3153",
  3071: "3071",
  3115: "3115",
  3089: "3089",
  3135: "3135",
  3157: "3157",
  3041: "3041",
  4633: "4633",
  3102: "3102",
  3152: "3152_Item_HextechRocketbelt",
  3100: "3100",
};

interface SimpleBuildCardProps {
  championId: number;
  championName: string;
}

export function SimpleBuildCard({ championId, championName }: SimpleBuildCardProps) {
  const items = CORE_ITEMS[championId] || [3340, 3078, 3153]; // Default

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white text-base">
          <ShoppingCart className="w-4 h-4 text-emerald-400" />
          Core Build
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          {items.map((itemId, index) => (
            <div
              key={itemId}
              className="relative group"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden relative">
                <div
                  className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs"
                >
                  {ITEM_ICONS[itemId] ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/14.5.1/img/item/${ITEM_ICONS[itemId]}.png`}
                      alt={ITEM_NAMES[itemId] || "Item"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Sword className="w-5 h-5" />
                  )}
                </div>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {ITEM_NAMES[itemId] || `Item ${itemId}`}
              </div>

              {/* Order badge */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Popular build for {championName}
        </p>
      </CardContent>
    </Card>
  );
}
