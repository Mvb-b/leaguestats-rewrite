import { SummonerHeader } from "@/app/components/SummonerHeader";
import { StatsGrid } from "@/app/components/StatsGrid";
import { MatchList } from "@/app/components/MatchList";
import { ChampionStats } from "@/app/components/ChampionStats";
import { RecordView } from "@/app/components/RecordView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { mockSummoner, mockMatches, calculateChampionStats, Match } from "@/lib/data";
import { Metadata } from "next";

interface SummonerPageProps {
  params: {
    region: string;
    gameName: string;
    tagLine: string;
  };
}

// Generate metadata for the page
export async function generateMetadata({ params }: SummonerPageProps): Promise<Metadata> {
  const gameName = decodeURIComponent(params.gameName);
  const tagLine = decodeURIComponent(params.tagLine);
  return {
    title: `${gameName}#${tagLine} - GameStats`,
    description: `View stats, match history, and champion performance for ${gameName}#${tagLine}`,
  };
}

// Generate mock records from matches
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
  // In a real app, fetch summoner data based on params
  // For now, using mock data with URL params
  const summoner = {
    ...mockSummoner,
    region: params.region,
    gameName: decodeURIComponent(params.gameName),
    tagLine: decodeURIComponent(params.tagLine),
  };
  
  const championStats = calculateChampionStats(mockMatches);
  const records = generateMockRecords(mockMatches);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-12">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back Link */}
        <a
          href="/"
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors mb-4 inline-block"
        >
          ← Back to search
        </a>

        {/* Summoner Header */}
        <SummonerHeader summoner={summoner} />

        {/* Stats Grid */}
        <div className="mt-6">
          <StatsGrid matches={mockMatches} championStats={championStats} />
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-slate-900/50 border border-slate-700/50">
              <TabsTrigger
                value="matches"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
              >
                Matches
              </TabsTrigger>
              <TabsTrigger
                value="champions"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
              >
                Champions
              </TabsTrigger>
              <TabsTrigger
                value="records"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
              >
                Records
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
              >
                Overview
              </TabsTrigger>
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
              <Card className="bg-slate-900/50 border-slate-700/50 p-8 text-center">
                <h2 className="text-xl font-bold text-white mb-2">Overview</h2>
                <p className="text-slate-400">Detailed overview statistics coming soon...</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
