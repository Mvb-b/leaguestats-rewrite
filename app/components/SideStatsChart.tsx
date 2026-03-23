"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Swords, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface SideStats {
  blueSide: any | null;
  redSide: any | null;
  comparison: any | null;
}

interface SideStatsChartProps {
  puuid: string;
  region: string;
}

export function SideStatsChart({ puuid, region }: SideStatsChartProps) {
  const [stats, setStats] = useState<SideStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [puuid, region]);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/summoner/side-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puuid, region }),
      });

      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError("Error loading stats");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="h-64 bg-slate-800/50 rounded-lg animate-pulse" />;
  if (error) return <div className="text-red-400 text-center py-8">{error}</div>;
  if (!stats) return null;

  const { blueSide, redSide, comparison } = stats;
  const totalGames = (blueSide?.games || 0) + (redSide?.games || 0);

  return (
    <div className="space-y-6">
      {comparison && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-red-500/10 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Side Analysis
              </h3>
              <Badge className={comparison.preferredSide === "blue" ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}>
                Better on {comparison.preferredSide === "blue" ? "Blue" : "Red"}
              </Badge>
            </div>
            <p className="text-white mt-3">{comparison.winrateDifferenceText}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Blue Side */}
        <Card className={cn("border-2", blueSide && blueSide.winrate > (redSide?.winrate || 0) ? "bg-blue-500/5 border-blue-500/30" : "bg-slate-900/50 border-slate-700/50")}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-lg">Blue Side</div>
                <div className="text-sm text-slate-400 font-normal">Team 100</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {blueSide ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Games</span>
                  <span className="text-white font-bold">{blueSide.games}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Win Rate</span>
                  <span className={cn("font-bold text-lg", blueSide.winrate >= 50 ? "text-emerald-400" : "text-rose-400")}>
                    {blueSide.winrate}%
                  </span>
                </div>
                <div className="text-sm text-slate-500">{blueSide.wins}W / {blueSide.losses}L</div>
                <div className="pt-3 border-t border-slate-700/50 space-y-2">
                  <StatRow label="KDA" value={blueSide.averages.kda.toFixed(2)} />
                  <StatRow label="CS" value={blueSide.averages.cs.toString()} />
                  <StatRow label="Gold" value={blueSide.averages.goldEarned.toLocaleString()} />
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-4">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Red Side */}
        <Card className={cn("border-2", redSide && redSide.winrate > (blueSide?.winrate || 0) ? "bg-red-500/5 border-red-500/30" : "bg-slate-900/50 border-slate-700/50")}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Swords className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-lg">Red Side</div>
                <div className="text-sm text-slate-400 font-normal">Team 200</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {redSide ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Games</span>
                  <span className="text-white font-bold">{redSide.games}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Win Rate</span>
                  <span className={cn("font-bold text-lg", redSide.winrate >= 50 ? "text-emerald-400" : "text-rose-400")}>
                    {redSide.winrate}%
                  </span>
                </div>
                <div className="text-sm text-slate-500">{redSide.wins}W / {redSide.losses}L</div>
                <div className="pt-3 border-t border-slate-700/50 space-y-2">
                  <StatRow label="KDA" value={redSide.averages.kda.toFixed(2)} />
                  <StatRow label="CS" value={redSide.averages.cs.toString()} />
                  <StatRow label="Gold" value={redSide.averages.goldEarned.toLocaleString()} />
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-4">No data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
