"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Gamepad2, AlertCircle } from "lucide-react";
import { tierColors } from "@/lib/data";

interface MultiSearchPlayer {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
  level: number;
  profileIconId: number;
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
  winrate: number;
  found: boolean;
  error?: string;
  recentChampions?: { id: number; name: string; games: number; wins: number }[];
}

interface MultiSearchResultsProps {
  players: MultiSearchPlayer[];
  isLoading: boolean;
}

function getChampionIconUrl(championId: number): string {
  const championMap: Record<number, string> = {
    61: "Orianna", 268: "Azir", 112: "Viktor", 84: "Akali", 7: "LeBlanc",
    157: "Yasuo", 64: "LeeSin", 202: "Jhin", 236: "Lucian", 81: "Ezreal",
    1: "Annie", 2: "Olaf", 3: "Galio", 4: "TwistedFate", 5: "XinZhao",
    11: "MasterYi", 22: "Ashe", 24: "Jax", 25: "Morgana", 32: "Amumu",
    33: "Rammus", 34: "Anivia", 51: "Caitlyn", 53: "Blitzcrank", 54: "Malphite",
    55: "Katarina", 62: "Wukong", 67: "Vayne", 86: "Garen", 99: "Lux",
    103: "Ahri", 122: "Darius", 141: "Kayn", 142: "Zoe", 145: "Kaisa",
    150: "Gnar", 222: "Jinx", 238: "Zed", 245: "Ekko", 266: "Aatrox",
    350: "Yuumi", 360: "Samira", 412: "Thresh", 497: "Rakan", 498: "Xayah",
    516: "Sylas", 555: "Pyke", 777: "Yone", 875: "Sett", 887: "Gwen",
  };
  const name = championMap[championId] || "Unknown";
  return `https://ddragon.leagueoflegends.com/cdn/14.5.1/img/champion/${name}.png`;
}

function PlayerCard({ player }: { player: MultiSearchPlayer }) {
  if (!player.found) {
    return (
      <Card className="bg-slate-900/30 border-slate-700/30 h-full">
        <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-slate-500 mb-2" />
          <p className="text-slate-400 font-medium">{player.gameName}</p>
          <p className="text-sm text-slate-500">#{player.tagLine}</p>
          <p className="text-xs text-red-400 mt-2">{player.error || "Not found"}</p>
        </CardContent>
      </Card>
    );
  }

  const totalGames = player.wins + player.losses;
  const recentGames = player.recentChampions || [
    { id: 61, name: "Orianna", games: 8, wins: 5 },
    { id: 268, name: "Azir", games: 5, wins: 2 },
    { id: 112, name: "Viktor", games: 4, wins: 3 },
  ];

  return (
    <Card className="bg-slate-900/80 border-slate-700/50 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-slate-700">
            <AvatarImage src={`https://ddragon.leagueoflegends.com/cdn/14.5.1/img/profileicon/${player.profileIconId}.png`} alt="" />
            <AvatarFallback className="bg-slate-700 text-sm">
              {player.gameName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate">{player.gameName}</h3>
            <p className="text-xs text-slate-400">#{player.tagLine}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Rank */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className={`w-4 h-4 ${player.tier ? tierColors[player.tier] : "text-slate-400"}`} />
            <span className={`font-semibold text-sm ${player.tier ? tierColors[player.tier] : "text-slate-400"}`}>
              {player.tier || "UNRANKED"} {player.rank}
            </span>
          </div>
          <Badge variant="outline" className="text-slate-400 border-slate-600 text-xs">
            {player.lp} LP
          </Badge>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-lg font-bold text-white">{totalGames}</p>
            <p className="text-xs text-slate-500">Games</p>
          </div>
          <div className={`rounded p-2 ${player.winrate >= 50 ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
            <p className={`text-lg font-bold ${player.winrate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
              {player.winrate}%
            </p>
            <p className="text-xs text-slate-500">
              {player.wins}W - {player.losses}L
            </p>
          </div>
        </div>
        {/* Recent Champions */}
        <div>
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
            <Gamepad2 className="w-3 h-3" /> Recent Champions
          </p>
          <div className="flex gap-2">
            {recentGames.map((champ) => (
              <div key={champ.id} className="relative group">
                <img
                  src={getChampionIconUrl(champ.id)}
                  alt=""
                  className={`w-10 h-10 rounded border ${
                    champ.games > 0 && champ.wins / champ.games >= 0.5
                      ? "border-emerald-500/50"
                      : "border-rose-500/50"
                  }`}
                />
                <div className="absolute -bottom-1 right-0 text-[10px] font-bold bg-slate-800 px-1 rounded">
                  {Math.round((champ.wins / (champ.games || 1)) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card className="bg-slate-900/30 border-slate-700/30 h-full">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}

export function MultiSearchResults({ players, isLoading }: MultiSearchResultsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  if (players.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {players.map((player) => (
        <PlayerCard key={player.puuid || player.gameName} player={player} />
      ))}
    </div>
  );
}
