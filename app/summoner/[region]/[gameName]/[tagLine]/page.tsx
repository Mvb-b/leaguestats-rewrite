import { SummonerHeader } from "@/app/components/SummonerHeader";
import { StatsGrid } from "@/app/components/StatsGrid";
import { MatchList } from "@/app/components/MatchList";
import { ChampionStats } from "@/app/components/ChampionStats";
import { SimpleBuildCard } from "@/app/components/SimpleBuildCard";
import { RecordView } from "@/app/components/RecordView";
import { LiveGameCard } from "@/app/components/LiveGameCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockSummoner, mockMatches, calculateChampionStats, Match } from "@/lib/data";
import { Metadata } from "next";
import Link from "next/link";
import { History, Users, Package, BarChart2 } from "lucide-react";

interface SummonerPageProps {
  params: {
    region: string;
    gameName: string;
    tagLine: string;
  };
}

export async function generateMetadata({ params }: SummonerPageProps): Promise<Metadata> {
  const gameName = decodeURIComponent(params.gameName);
  const tagLine = decodeURIComponent(params.tagLine);
  return {
    title: `${gameName}#${tagLine} - GameStats`,
    description: `View stats, match history, and champion performance for ${gameName}#${tagLine}`,
  };
}

function generateMockRecords(matches: Match[]) {
  return [
    {
      id: "rec-1",
      type: "kills" as const,
      value: 18,
      match: matches[4],
      championId: 157,
      championName: "Yasuo",
      date: matches[4]?.date || "2026-03-19T21:10:00Z",
    },
    {
      id: "rec-2",
      type: "kda" as const,
      value: "21.0",
      match: matches[2],
      championId: 112,
      championName: "Viktor",
      date: matches[2]?.date || "2026-03-20T20:45:00Z",
    },
    {
      id: "rec-3",
      type: "cs" as const,
      value: 9.6,
      match: matches[0],
      championId: 61,
      championName: "Orianna",
      date: matches[0]?.date || "2026-03-21T18:30:00Z",
    },
    {
      id: "rec-4",
      type: "assists" as const,
      value: 12,
      match: matches[0],
      championId: 61,
      championName: "Orianna",
      date: matches[0]?.date || "2026-03-21T18:30:00Z",
    },
  ];
}

export default function SummonerPage({ params }: SummonerPageProps) {
  const summoner = {
    ...mockSummoner,
    region: params.region,
    gameName: decodeURIComponent(params.gameName),
    tagLine: decodeURIComponent(params.tagLine),
  };
  const championStats = calculateChampionStats(mockMatches);
  const records = generateMockRecords(mockMatches);
  
  // Get top champion for build card demo
  const topChampion = championStats[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-12">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back Link */}
        <a href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors mb-4 inline-block">
          ← Back to search
        </a>

        {/* Summoner Header */}
        <SummonerHeader summoner={summoner} />

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          <Link href={`/summoner/${params.region}/${params.gameName}/${params.tagLine}/rewind`}>
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
              <History className="w-4 h-4 mr-2" />
              View Rewind Stats
            </Button>
          </Link>
          <Link href="/multi-search">
            <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
              <Users className="w-4 h-4 mr-2" />
              Multi-Search
            </Button>
          </Link>
        </div>

        {/* Live Game Card */}
        <div className="mt-6">
          <LiveGameCard puuid={summoner.puuid} region={summoner.region} currentSummonerName={summoner.gameName} />
        </div>

        {/* Stats Grid */}
        <div className="mt-6">
          <StatsGrid matches={mockMatches} championStats={championStats} />
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-slate-900/50 border border-slate-700/50">
              <TabsTrigger value="matches" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">Matches</TabsTrigger>
              <TabsTrigger value="champions" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">Champions</TabsTrigger>
              <TabsTrigger value="records" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">Records</TabsTrigger>
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Match History</h2>
                <span className="text-sm text-slate-500">{mockMatches.length} games</span>
              </div>
              <MatchList matches={mockMatches} />
            </TabsContent>

            <TabsContent value="champions" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Champion Statistics</h2>
                <span className="text-sm text-slate-500">{championStats.length} champions</span>
              </div>
              <ChampionStats stats={championStats} />
            </TabsContent>

            <TabsContent value="records" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Personal Records</h2>
              </div>
              <RecordView records={records} />
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Featured Champion Build */}
                {topChampion && (
                  <SimpleBuildCard 
                    championId={topChampion.championId} 
                    championName={topChampion.championName} 
                  />
                )}
                
                {/* Quick Stats */}
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart2 className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-slate-800/50">
                        <p className="text-sm text-slate-400">Win Rate</p>
                        <p className="text-2xl font-bold text-white">{summoner.winrate}%</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/50">
                        <p className="text-sm text-slate-400">Total Games</p>
                        <p className="text-2xl font-bold text-white">{summoner.wins + summoner.losses}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Available Champions Links */}
              <div className="mt-8">
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-semibold text-white">Rune Guides</h3>
                    </div>
                    <p className="text-slate-400 mb-4 text-sm">
                      View recommended rune setups for popular champions
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {["yasuo", "zed", "jinx"].map((c) => (
                        <Link
                          key={c}
                          href={`/runes/${c}`}
                          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
                        >
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
