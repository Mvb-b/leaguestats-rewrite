"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Match, ChampionStatsData } from "@/lib/data";
import { TrendingUp, TrendingDown, Target, Clock, Swords } from "lucide-react";

interface StatsGridProps {
  matches: Match[];
  championStats: ChampionStatsData[];
}

export function StatsGrid({ matches, championStats }: StatsGridProps) {
  // Calculate overall stats
  const totalGames = matches.length;
  const wins = matches.filter(m => m.result === "win").length;
  const losses = matches.filter(m => m.result === "loss").length;
  const winrate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0";
  
  const avgKills = matches.reduce((sum, m) => sum + m.summonerPerformance.kills, 0) / totalGames;
  const avgDeaths = matches.reduce((sum, m) => sum + m.summonerPerformance.deaths, 0) / totalGames;
  const avgAssists = matches.reduce((sum, m) => sum + m.summonerPerformance.assists, 0) / totalGames;
  const kda = avgDeaths > 0 ? ((avgKills + avgAssists) / avgDeaths).toFixed(2) : (avgKills + avgAssists).toFixed(2);
  
  const avgCs = matches.reduce((sum, m) => sum + m.summonerPerformance.csPerMin, 0) / totalGames;
  const avgDuration = matches.reduce((sum, m) => sum + m.gameDuration, 0) / totalGames;
  const avgDurationMins = Math.floor(avgDuration / 60);

  const stats = [
    {
      title: "Win Rate",
      value: `${winrate}%`,
      subtext: `${wins}W - ${losses}L`,
      icon: parseFloat(winrate) >= 50 ? TrendingUp : TrendingDown,
      color: parseFloat(winrate) >= 50 ? "text-emerald-400" : "text-rose-400",
      bgColor: parseFloat(winrate) >= 50 ? "bg-emerald-500/10" : "bg-rose-500/10",
    },
    {
      title: "KDA",
      value: kda,
      subtext: `${avgKills.toFixed(1)} / ${avgDeaths.toFixed(1)} / ${avgAssists.toFixed(1)}`,
      icon: Target,
      color: parseFloat(kda) >= 3 ? "text-cyan-400" : "text-slate-400",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "CS/min",
      value: avgCs.toFixed(1),
      subtext: "Average CS per minute",
      icon: Swords,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Avg Game",
      value: `${avgDurationMins}m`,
      subtext: "Average game duration",
      icon: Clock,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className="bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-colors"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className="text-xs text-slate-500 mt-0.5">{stat.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
