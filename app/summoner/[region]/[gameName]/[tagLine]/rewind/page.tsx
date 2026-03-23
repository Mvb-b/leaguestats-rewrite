"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RewindDashboard } from "@/app/components/RewindDashboard";
import { SideStatsChart } from "@/app/components/SideStatsChart";
import { YearReviewCard } from "@/app/components/YearReviewCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, Scale, Calendar } from "lucide-react";

export default function RewindPage() {
  const params = useParams();
  const region = params.region as string;
  const gameName = decodeURIComponent(params.gameName as string);
  const tagLine = decodeURIComponent(params.tagLine as string);
  
  // Mock PUUID - in production this would come from the summoner data
  const mockPuuid = "00000000-0000-0000-0000-000000000000";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-12">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back Link */}
        <Link href={`/summoner/${region}/${gameName}/${tagLine}`}>
          <Button variant="ghost" className="text-slate-400 hover:text-white mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Rewind
            </span>
            <span className="text-slate-400"> · </span>
            <span>{gameName}</span>
            <span className="text-slate-500">#{tagLine}</span>
          </h1>
          <p className="text-slate-400">
            Match history aggregation and statistics inspired by rewind.lol
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-slate-900/50 border border-slate-700/50 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 text-slate-400">
              <History className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sides" className="data-[state=active]:bg-slate-800 text-slate-400">
              <Scale className="w-4 h-4 mr-2" />
              Blue/Red
            </TabsTrigger>
            <TabsTrigger value="years" className="data-[state=active]:bg-slate-800 text-slate-400">
              <Calendar className="w-4 h-4 mr-2" />
              Years
            </TabsTrigger>
            <TabsTrigger value="compare" className="data-[state=active]:bg-slate-800 text-slate-400">
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <RewindDashboard 
              puuid={mockPuuid} 
              region={region} 
              gameName={gameName} 
              tagLine={tagLine} 
            />
          </TabsContent>

          <TabsContent value="sides" className="mt-0">
            <SideStatsChart 
              puuid={mockPuuid} 
              region={region} 
            />
          </TabsContent>

          <TabsContent value="years" className="mt-0">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Year in Review</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <YearReviewCard 
                  puuid={mockPuuid}
                  region={region}
                  gameName={gameName}
                  tagLine={tagLine}
                  year={2025}
                  compact
                />
                <YearReviewCard 
                  puuid={mockPuuid}
                  region={region}
                  gameName={gameName}
                  tagLine={tagLine}
                  year={2024}
                  compact
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compare" className="mt-0">
            <Card className="bg-slate-900/50 border-slate-700/50 p-8 text-center">
              <CardHeader>
                <CardTitle className="text-white">Compare Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Compare your stats with friends coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
