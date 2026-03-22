"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Summoner, tierColors } from "@/lib/data";
import { Trophy, TrendingUp } from "lucide-react";

interface SummonerHeaderProps {
  summoner: Summoner;
}

export function SummonerHeader({ summoner }: SummonerHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-6">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative flex flex-col md:flex-row items-center gap-6">
        {/* Avatar Section */}
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-slate-700 shadow-2xl">
            <AvatarImage 
              src={`https://ddragon.leagueoflegends.com/cdn/14.5.1/img/profileicon/${summoner.profileIconId}.png`}
              alt={summoner.gameName}
              className="object-cover"
            />
            <AvatarFallback className="bg-slate-700 text-2xl font-bold text-slate-200">
              {summoner.gameName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Level badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-full px-2 py-0.5 text-xs font-semibold text-slate-300">
            {summoner.level}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {summoner.gameName}
            </h1>
            <span className="text-xl text-slate-400 font-medium">
              #{summoner.tagLine}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
            <Badge 
              variant="secondary" 
              className="bg-slate-800/80 border border-slate-600 text-slate-300"
            >
              {summoner.region.toUpperCase()}
            </Badge>
            <Badge 
              className={`${tierColors[summoner.tier] || "text-slate-300"} bg-slate-800/80 border border-slate-600`}
            >
              <Trophy className="w-3 h-3 mr-1" />
              {summoner.tier} {summoner.rank}
            </Badge>
            <Badge 
              className="bg-slate-800/80 border border-slate-600 text-cyan-400"
            >
              {summoner.lp} LP
            </Badge>
            <Badge 
              variant="outline"
              className={`border-slate-600 ${summoner.winrate >= 50 ? "text-emerald-400" : "text-rose-400"}`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {summoner.winrate}%
            </Badge>
          </div>
        </div>

        {/* Rank Section */}
        <div className="flex flex-col items-center md:items-end">
          <div className="text-right">
            <p className="text-sm text-slate-400">Season 14</p>
            <p className="text-lg font-semibold text-white">
              {summoner.wins}W - {summoner.losses}L
            </p>
            <p className="text-xs text-slate-500">
              Total games: {summoner.wins + summoner.losses}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
