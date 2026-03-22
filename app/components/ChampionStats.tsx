"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChampionStatsData, getChampionIconUrl } from "@/lib/data";
import { Target } from "lucide-react";
import Image from "next/image";

interface ChampionStatsProps {
  stats: ChampionStatsData[];
}

export function ChampionStats({ stats }: ChampionStatsProps) {
  if (stats.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 p-8 text-center">
        <p className="text-slate-400">No champion data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {stats.map((champion) => (
        <Card
          key={champion.championId}
          className="bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-colors"
        >
          <div className="flex items-center gap-4 p-4">
            {/* Champion Image */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={getChampionIconUrl(champion.championId)}
                  alt={champion.championName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-slate-700 text-xs font-medium px-1.5 rounded text-white">
                {champion.games}
              </div>
            </div>

            {/* Champion Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-white truncate">
                  {champion.championName}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${champion.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {champion.winrate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-500">
                    {champion.wins}W {champion.losses}L
                  </span>
                </div>
              </div>
              {/* Winrate Bar */}
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    champion.winrate >= 50 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${champion.winrate}%` }}
                />
              </div>
            </div>

            {/* KDA */}
            <div className="text-right min-w-[80px] shrink-0">
              <div className="flex items-center justify-end gap-1 text-xs text-slate-400">
                <Target className="w-3 h-3" />
                <span>KDA</span>
              </div>
              <p className="text-sm font-semibold text-white">
                {champion.kda.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">
                {champion.avgKills.toFixed(1)} / {champion.avgDeaths.toFixed(1)} / {champion.avgAssists.toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
