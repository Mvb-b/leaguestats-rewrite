"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Match, formatDate, formatDuration, getChampionIconUrl, getQueueName } from "@/lib/data";
import { ChevronRight, Swords } from "lucide-react";
import Image from "next/image";

interface MatchListProps {
  matches: Match[];
}

export function MatchList({ matches }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 p-8 text-center">
        <CardTitle className="text-slate-400">No matches found</CardTitle>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <Card
          key={match.id}
          className={`bg-slate-900/50 border-l-4 ${
            match.result === "win" ? "border-l-emerald-500" : "border-l-rose-500"
          } border-slate-700/50 hover:border-slate-600/50 transition-colors cursor-pointer group`}
        >
          <div className="flex items-center gap-3 p-4">
            {/* Champion Icon */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={getChampionIconUrl(match.summonerPerformance.championId)}
                  alt={match.summonerPerformance.championName}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Match Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="secondary"
                  className={`
                    text-xs font-medium
                    ${match.result === "win" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }
                  `}
                >
                  {match.result === "win" ? "Victory" : "Defeat"}
                </Badge>
                <span className="text-xs text-slate-500">
                  {getQueueName(match.queueId)}
                </span>
              </div>
              
              <h3 className="text-sm font-semibold text-white truncate">
                {match.summonerPerformance.championName}
              </h3>
              
              <p className="text-xs text-slate-500">
                {formatDate(match.date)} • {formatDuration(match.gameDuration)}
              </p>
            </div>

            {/* KDA Stats */}
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-sm font-medium text-white">
                <span className="text-emerald-400">{match.summonerPerformance.kills}</span>
                <span className="text-slate-600">/</span>
                <span className="text-rose-400">{match.summonerPerformance.deaths}</span>
                <span className="text-slate-600">/</span>
                <span className="text-blue-400">{match.summonerPerformance.assists}</span>
              </div>
              <p className="text-xs text-slate-400">
                {match.summonerPerformance.kda.toFixed(2)} KDA
              </p>
              <p className="text-xs text-slate-500">
                {match.summonerPerformance.csPerMin.toFixed(1)} CS/min
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
          </div>
        </Card>
      ))}
    </div>
  );
}
