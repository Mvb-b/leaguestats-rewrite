"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MultiSearchResults } from "@/app/components/MultiSearchResults";
import { Search, Users, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";

interface ParsedSummoner {
  gameName: string;
  tagLine: string;
  region: string;
  raw: string;
}

function parseSummonerInput(input: string): ParsedSummoner[] {
  const lines = input.split(/\n/).map(l => l.trim()).filter(Boolean);
  const summoners: ParsedSummoner[] = [];
  
  const regionRegex = /^\[?([a-zA-Z]{2,4})\]?\s*/i;
  
  for (const line of lines) {
    let cleanLine = line;
    let region = "na1"; // default
    
    const regionMatch = line.match(regionRegex);
    if (regionMatch) {
      region = regionMatch[1].toLowerCase();
      cleanLine = line.slice(regionMatch[0].length).trim();
    }
    
    // Parse Name#Tag o Name # Tag
    const hashMatch = cleanLine.match(/^(.+?)\s*#\s*(.+)$/);
    const spaceMatch = cleanLine.match(/^(.+?)\s+(\w{2,5})$/);
    
    let gameName = cleanLine;
    let tagLine = "";
    
    if (hashMatch) {
      gameName = hashMatch[1].trim();
      tagLine = hashMatch[2].trim();
    } else if (spaceMatch) {
      gameName = spaceMatch[1].trim();
      tagLine = spaceMatch[2].trim();
    }
    
    if (gameName) {
      summoners.push({ gameName, tagLine, region, raw: line });
    }
  }
  
  return summoners.slice(0, 5); // Max 5
}

export default function MultiSearchPage() {
  const [input, setInput] = useState("");
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedCount, setParsedCount] = useState(0);

  const handleInputChange = (value: string) => {
    setInput(value);
    const parsed = parseSummonerInput(value);
    setParsedCount(parsed.length);
  };

  const handleSearch = async () => {
    const summoners = parseSummonerInput(input);
    if (summoners.length === 0) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/multi-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summoners }),
      });
      
      if (!res.ok) throw new Error("Search failed");
      
      const data = await res.json();
      setPlayers(data.players || []);
    } catch (error) {
      console.error("Multi-search error:", error);
      // Mostrar summoners con error
      setPlayers(summoners.map(s => ({
        ...s,
        found: false,
        error: "Failed to fetch data",
      })));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              Multi-Search
            </h1>
          </div>
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
            Beta
          </Badge>
        </div>

        {/* Input Section */}
        <Card className="bg-slate-900/50 border-slate-700/50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">
                Paste team summoners (one per line)
              </label>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-3 h-3" />
                <span>Format: Name#Tag or [region] Name #Tag</span>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="[NA] Faker #KR1&#10;Doublelift #NA1&#10;[EUW] Caps #G2"
              className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-slate-200 
                       placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                       resize-none font-mono text-sm"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${parsedCount > 0 ? "text-cyan-400" : "text-slate-500"}`}>
                  {parsedCount}/5 summoners detected
                </span>
              </div>
              <Button
                onClick={handleSearch}
                disabled={parsedCount === 0 || isLoading}
                className="bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Team
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {(players.length > 0 || isLoading) && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              Team Analysis
              {!isLoading && (
                <Badge className="ml-2 bg-slate-800">
                  {players.filter(p => p.found).length}/{players.length} found
                </Badge>
              )}
            </h2>
            <MultiSearchResults players={players} isLoading={isLoading} />
          </div>
        )}

        {/* Empty state hint */}
        {players.length === 0 && !isLoading && (
          <Card className="bg-slate-900/30 border-slate-800/50 border-dashed">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-400 mb-1">
                Analyze your team or enemy lineup
              </h3>
              <p className="text-sm text-slate-500">
                Paste up to 5 summoner names to see their ranks, winrates, and recent champions
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
