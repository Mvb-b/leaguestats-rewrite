"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Clock, Target, Zap, TrendingUp, ChevronRight, Gamepad2, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface YearReviewCardProps {
  puuid: string;
  region: string;
  gameName: string;
  tagLine: string;
  year: number;
  compact?: boolean;
}

export function YearReviewCard({ puuid, region, gameName, tagLine, year, compact = false }: YearReviewCardProps) {
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReview();
  }, [puuid, region, year]);

  async function fetchReview() {
    setLoading(true);
    try {
      const res = await fetch("/api/summoner/rewind-year", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puuid, region, year }),
      });

      if (!res.ok) throw new Error("Failed to fetch year review");
      const data = await res.json();
      setReview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="h-32 bg-slate-800/50 rounded-lg animate-pulse" />;
  if (error || !review || !review.hasData) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 opacity-50">
        <CardContent className="p-6 text-center">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500">No data for {year}</p>
        </CardContent>
      </Card>
    );
  }

  const { summary } = review;

  if (compact) {
    return (
      <Link href={`/summoner/${region}/${gameName}/${tagLine}/rewind/${year}`}>
        <Card className="bg-slate-900/50 border-slate-700/50 hover:border-cyan-500/50 transition-all cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {year} in Review
                </h3>
                <p className="text-slate-400 mt-1">
                  {summary?.totalGames} games • {summary?.hoursPlayed} hours played
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400" />
            </div>
            <div className="flex gap-4 mt-4">
              <Badge className="bg-emerald-500/20 text-emerald-400">
                {summary?.winrate}% WR
              </Badge>
              {summary?.mostPlayedChampion && (
                <Badge className="bg-purple-500/20 text-purple-400">
                  Top: {summary.mostPlayedChampion.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Full version layout
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-slate-700/50">
        <CardContent className="p-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {gameName}#{tagLine}&apos;s
          </h1>
          <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
            {year} Rewind
          </div>
          <p className="text-slate-400 mt-4 text-lg">
            {summary.totalGames} games • {summary.hoursPlayed} hours • {summary.winrate}% winrate
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Gamepad2} value={summary.totalGames} label="Games" color="cyan" />
        <StatCard icon={Clock} value={`${Math.round(summary.hoursPlayed)}h`} label="Hours" color="amber" />
        <StatCard icon={Target} value={summary.avgKda.toFixed(2)} label="Avg KDA" color="emerald" />
        <StatCard icon={Trophy} value={`${summary.winrate}%`} label="Win Rate" color={summary.winrate >= 50 ? "emerald" : "rose"} />
      </div>

      {summary.mostPlayedChampion && (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Most Played: {summary.mostPlayedChampion.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">{summary.mostPlayedChampion.games} games • {summary.mostPlayedChampion.winrate}% WR</p>
          </CardContent>
        </Card>
      )}

      {review.champions && review.champions.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Top Champions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {review.champions.slice(0, 5).map((champ: any, i: number) => (
                <div key={champ.championId} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                  <span className="text-white">#{i + 1} {champ.championName}</span>
                  <span className={cn("font-bold", champ.winrate >= 50 ? "text-emerald-400" : "text-rose-400")}>
                    {champ.games} games • {champ.winrate}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: any) {
  const colors: Record<string, string> = {
    cyan: "bg-cyan-500/20 text-cyan-400",
    amber: "bg-amber-500/20 text-amber-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    rose: "bg-rose-500/20 text-rose-400",
    purple: "bg-purple-500/20 text-purple-400",
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 text-center p-4">
      <div className={`w-12 h-12 rounded-full ${colors[color] || colors.cyan} flex items-center justify-center mx-auto mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </Card>
  );
}
