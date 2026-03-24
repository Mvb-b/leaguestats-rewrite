import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Swords, Shield, Zap } from "lucide-react";

// Hardcoded rune data for popular champions
const CHAMPION_RUNES: Record<string, {
  name: string;
  title: string;
  keystone: {
    name: string;
    description: string;
  };
  primaryPath: string[];
  secondaryPath: string[];
  shards: {
    offense: string;
    flex: string;
    defense: string;
  };
}> = {
  yasuo: {
    name: "Yasuo",
    title: "The Unforgiven",
    keystone: {
      name: "Lethal Tempo",
      description: "Attack speed temporarily increased after hitting an enemy champion",
    },
    primaryPath: [
      "Triumph",
      "Legend: Alacrity",
      "Last Stand",
    ],
    secondaryPath: [
      "Second Wind",
      "Overgrowth",
    ],
    shards: {
      offense: "Attack Speed",
      flex: "Adaptive Force",
      defense: "Health",
    },
  },
  zed: {
    name: "Zed",
    title: "The Master of Shadows",
    keystone: {
      name: "Electrocute",
      description: "Burst damage after hitting a champion with 3 unique attacks",
    },
    primaryPath: [
      "Sudden Impact",
      "Eyeball Collection",
      "Ultimate Hunter",
    ],
    secondaryPath: [
      "Gathering Storm",
      "Absolute Focus",
    ],
    shards: {
      offense: "Adaptive Force",
      flex: "Adaptive Force",
      defense: "Health",
    },
  },
  jinx: {
    name: "Jinx",
    title: "The Loose Cannon",
    keystone: {
      name: "Lethal Tempo",
      description: "Attack speed temporarily increased after hitting an enemy champion",
    },
    primaryPath: [
      "Presence of Mind",
      "Legend: Bloodline",
      "Cut Down",
    ],
    secondaryPath: [
      "Absolute Focus",
      "Gathering Storm",
    ],
    shards: {
      offense: "Attack Speed",
      flex: "Adaptive Force",
      defense: "Health",
    },
  },
};

interface RunesPageProps {
  params: {
    champion: string;
  };
}

export function generateMetadata({ params }: RunesPageProps) {
  const champion = params.champion.toLowerCase();
  const data = CHAMPION_RUNES[champion];
  
  return {
    title: data ? `${data.name} - Runes | GameStats` : "Champion Runes | GameStats",
    description: data ? `Optimal runes for ${data.name} in League of Legends` : "Champion rune configurations",
  };
}

export default function RunesPage({ params }: RunesPageProps) {
  const champion = params.champion.toLowerCase();
  const runeData = CHAMPION_RUNES[champion];

  // Not found state
  if (!runeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="bg-slate-900/50 border-slate-700/50 max-w-md mx-auto p-8">
            <div className="text-6xl mb-4">❓</div>
            <h1 className="text-2xl font-bold text-white mb-2">Champion Not Found</h1>
            <p className="text-slate-400 mb-4">
              We don&apos;t have rune data for <span className="text-cyan-400">{params.champion}</span> yet.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Currently available: Yasuo, Zed, Jinx
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Search
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-12">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-300 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Search
        </Link>

        {/* Champion Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-1">
            <span className="text-cyan-400">{runeData.name}</span>
          </h1>
          <p className="text-slate-400">{runeData.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Runes */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Swords className="w-5 h-5 text-red-400" />
                Primary Path
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Keystone */}
              <div className="p-4 rounded-lg bg-red-950/20 border border-red-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-400">{runeData.keystone.name}</p>
                    <p className="text-sm text-slate-400">{runeData.keystone.description}</p>
                  </div>
                </div>
              </div>

              {/* Other runes */}
              <div className="space-y-2">
                {runeData.primaryPath.map((rune, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                      {index + 1}
                    </div>
                    <span className="text-slate-200">{rune}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Secondary Runes & Shards */}
          <div className="space-y-6">
            {/* Secondary Path */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Secondary Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {runeData.secondaryPath.map((rune, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                        {index + 1}
                      </div>
                      <span className="text-slate-200">{rune}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stat Shards */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  Stat Shards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <span className="text-slate-400">Offense</span>
                  <span className="text-emerald-400 font-medium">{runeData.shards.offense}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <span className="text-slate-400">Flex</span>
                  <span className="text-emerald-400 font-medium">{runeData.shards.flex}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <span className="text-slate-400">Defense</span>
                  <span className="text-emerald-400 font-medium">{runeData.shards.defense}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Champion Links */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-white mb-4">Other Champions</h3>
        <div className="flex flex-wrap gap-3">
          {["yasuo", "zed", "jinx"].map((c) => (
            <Link
              key={c}
              href={`/runes/${c}`}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                c === champion
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}
