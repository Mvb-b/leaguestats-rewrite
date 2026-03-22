"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

const REGIONS = [
  { value: "br", label: "BR" },
  { value: "eune", label: "EUNE" },
  { value: "euw", label: "EUW" },
  { value: "jp", label: "JP" },
  { value: "kr", label: "KR" },
  { value: "lan", label: "LAN" },
  { value: "las", label: "LAS" },
  { value: "na", label: "NA" },
  { value: "oce", label: "OCE" },
  { value: "tr", label: "TR" },
  { value: "ru", label: "RU" },
];

export function SearchForm() {
  const router = useRouter();
  const [region, setRegion] = useState("euw");
  const [summonerName, setSummonerName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summonerName.trim()) return;

    // Check if name contains # for tagline
    if (!summonerName.includes("#")) {
      alert("Please include your tag (e.g. Faker#KR1)");
      return;
    }

    setLoading(true);
    const [gameName, tagLine] = summonerName.split("#");
    
    if (gameName && tagLine) {
      const encodedName = encodeURIComponent(gameName.trim());
      const encodedTag = encodeURIComponent(tagLine.trim());
      router.push(`/summoner/${region}/${encodedName}/${encodedTag}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none sm:w-28 cursor-pointer"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Summoner#TAG (e.g. Faker#KR1)"
            value={summonerName}
            onChange={(e) => setSummonerName(e.target.value)}
            className="w-full px-4 py-3 pr-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 h-auto"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        </div>
        
        <Button
          type="submit"
          disabled={loading || !summonerName.trim()}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg disabled:opacity-50 h-auto"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </div>
      
      <p className="text-sm text-slate-500">
        Enter your summoner name with your tag (e.g. Faker#KR1)
      </p>
    </form>
  );
}
