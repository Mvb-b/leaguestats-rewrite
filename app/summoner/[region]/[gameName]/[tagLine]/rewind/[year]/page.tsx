"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { YearReviewCard } from "@/app/components/YearReviewCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";

export default function YearPage() {
  const params = useParams();
  const region = params.region as string;
  const gameName = decodeURIComponent(params.gameName as string);
  const tagLine = decodeURIComponent(params.tagLine as string);
  const year = parseInt(params.year as string);
  
  const mockPuuid = "00000000-0000-0000-0000-000000000000";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-12">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back Link */}
        <Link href={`/summoner/${region}/${gameName}/${tagLine}/rewind`}>
          <Button variant="ghost" className="text-slate-400 hover:text-white mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rewind
          </Button>
        </Link>

        {/* Year Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-cyan-400" />
              {year} in Review
            </h1>
            <p className="text-slate-400 mt-2">
              {gameName}#{tagLine} · Annual statistics and highlights
            </p>
          </div>
          
          {/* Year Navigation */}
          <div className="flex gap-2">
            <Link href={`/summoner/${region}/${gameName}/${tagLine}/rewind/${year - 1}`}>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-400 hover:text-white">
                ← {year - 1}
              </Button>
            </Link>
            {year < 2025 && (
              <Link href={`/summoner/${region}/${gameName}/${tagLine}/rewind/${year + 1}`}>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-400 hover:text-white">
                  {year + 1} →
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Year Review Content */}
        <YearReviewCard 
          puuid={mockPuuid}
          region={region}
          gameName={gameName}
          tagLine={tagLine}
          year={year}
          compact={false}
        />
      </div>
    </div>
  );
}
