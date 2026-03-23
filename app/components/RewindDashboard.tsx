"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Target, TrendingUp, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RewindDashboardProps {
  puuid: string;
  region: string;
  gameName: string;
  tagLine: string;
}

export function RewindDashboard({ puuid, region }: RewindDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ dateRange: "all" as "all" | "30d" | "3m" | "1y" });

  useEffect(() => {
    fetchStats();
  }, [puuid, region, filters]);

  async function fetchStats() {
    setLoading(true);
    try {
      const payload: any = { puuid, region };
      if (filters.dateRange !== "all") {
        payload.filters = {};
        const now = new Date();
        if (filters.dateRange === "30d") {
          payload.filters.startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        } else if (filters.dateRange === "3m") {
          payload.filters.startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
        } else if (filters.dateRange === "1y") {
          payload.filters.startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
        }
      }

      const res = await fetch("/api/summoner/rewind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="h-64 bg-slate-800/50 rounded-lg animate-pulse" />;
  if (error) return <div className="text-red-400 text-center py-8">{error}</div>;
  if (!stats || stats.totalGames === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 p-8 text-center">
        <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Data</h3>
        <p className="text-slate-400">No match history found</p>
      </Card>
    );
  }

  const formatNumber = (n: number) => n.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {["all", "30d", "3m", "1y"].map((range) => (
              <Button
                key={range}
                variant={filters.dateRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ dateRange: range as any })}
                className={cn("text-xs", filters.dateRange === range ? "bg-cyan-500" : "border-slate-600")}
              >
                {range === "all" ? "All Time" : range === "30d" ? "30 Days" : range === "3m" ? "3 Months" : "1 Year"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Games" value={formatNumber(stats.totalGames)} subtext={`${stats.wins}W / ${stats.losses}L`} icon={Gamepad2} color="cyan" />
        <StatCard title="Win Rate" value={`${stats.winrate}%`} icon={TrendingUp} color={stats.winrate >= 50 ? "emerald" : "rose"} />
        <StatCard title="Time" value={`${stats.timeSpent.hours}h`} subtext={`${stats.timeSpent.days} days`} icon={Clock} color="amber" />
        <StatCard title="KDA" value={stats.kda.ratio.toFixed(2)} subtext={`${stats.averages.kills.toFixed(1)} / ${stats.averages.deaths.toFixed(1)} / ${stats.averages.assists.toFixed(1)}`} icon={Target} color="emerald" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="champions" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-slate-900/50 border border-slate-700/50">
          <TabsTrigger value="champions" className="data-[state=active]:bg-slate-800">Champions</TabsTrigger>
          <TabsTrigger value="queues" className="data-[state=active]:bg-slate-800">Queues</TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-slate-800">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="champions" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Top Champions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.champions.slice(0, 5).map((champ: any, i: number) => (
                  <div key={champ.championId} className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-slate-400 w-6">#{i + 1}</span>
                    <span className="text-white flex-1">{champ.championName}</span>
                    <span className="text-slate-400">{champ.games} games</span>
                    <Badge className={cn("ml-2", champ.winrate >= 50 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
                      {champ.winrate}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queues" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Queue Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.queues.map((queue: any) => (
                  <div key={queue.queueId} className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-white">{queue.name}</span>
                    <span className="text-slate-400">{queue.games} games</span>
                    <Badge className={cn(queue.winrate >= 50 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
                      {queue.winrate}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.monthlyStats.slice(-6).map((month: any) => (
                  <div key={month.month} className="flex items-center gap-4 p-2">
                    <div className="w-16 text-slate-400 text-sm">{month.month}</div>
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div className="bg-cyan-500 rounded-full h-2" style={{ width: `${Math.min((month.games / (stats.monthlyStats[0]?.games || 1)) * 100, 100)}%` }} />
                    </div>
                    <div className="text-right min-w-[80px]">
                      <div className="text-white">{month.games} games</div>
                      <div className="text-xs text-slate-500">{month.hoursPlayed}h</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, subtext, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    cyan: "bg-cyan-500/20 text-cyan-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    rose: "bg-rose-500/20 text-rose-400",
    amber: "bg-amber-500/20 text-amber-400",
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-slate-400 uppercase flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${colors[color]}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
      </CardContent>
    </Card>
  );
}
