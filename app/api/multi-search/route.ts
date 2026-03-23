/**
 * POST /api/multi-search
 * Busca múltiples summoners simultáneamente
 * Body: { summoners: [{ gameName: string, tagLine: string, region: string }] }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRiotClient, isValidRegion, Region as RiotRegion } from "@/lib/riot-api";

const summonerSchema = z.object({
  gameName: z.string().min(1),
  tagLine: z.string().min(1),
  region: z.string(),
});

const requestSchema = z.object({
  summoners: z.array(summonerSchema).max(5),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summoners } = requestSchema.parse(body);

    const riotClient = getRiotClient();
    const results = await Promise.all(
      summoners.map(async (summoner) => {
        try {
          if (!isValidRegion(summoner.region)) {
            return {
              found: false,
              gameName: summoner.gameName,
              tagLine: summoner.tagLine,
              region: summoner.region,
              error: "Invalid region",
            };
          }

          // Get account info
          const account = await riotClient.getAccountByRiotId(
            summoner.gameName,
            summoner.tagLine,
            summoner.region as RiotRegion
          );

          if (!account) {
            return {
              found: false,
              gameName: summoner.gameName,
              tagLine: summoner.tagLine,
              region: summoner.region,
              error: "Summoner not found",
            };
          }

          // Get summoner info
          const summonerInfo = await riotClient.getSummonerByPuuid(
            account.puuid,
            summoner.region as RiotRegion
          );

          // Get ranked info
          const rankedInfo = await riotClient.getRankedStats(
            summonerInfo.id,
            summoner.region as RiotRegion
          );

          const soloQueue = rankedInfo.find((q) => q.queueType === "RANKED_SOLO_5x5");
          
          // Mock recent champions - en producción vendría de match history
          const recentChampions = [
            { id: 61, name: "Orianna", games: 12, wins: 7 },
            { id: 268, name: "Azir", games: 8, wins: 4 },
            { id: 112, name: "Viktor", games: 6, wins: 4 },
          ];

          return {
            found: true,
            puuid: account.puuid,
            gameName: summoner.gameName,
            tagLine: summoner.tagLine,
            region: summoner.region,
            level: summonerInfo.summonerLevel,
            profileIconId: summonerInfo.profileIconId,
            tier: soloQueue?.tier || "UNRANKED",
            rank: soloQueue?.rank || "",
            lp: soloQueue?.leaguePoints || 0,
            wins: soloQueue?.wins || 0,
            losses: soloQueue?.losses || 0,
            winrate: soloQueue 
              ? Math.round((soloQueue.wins / (soloQueue.wins + soloQueue.losses)) * 100)
              : 0,
            recentChampions,
          };
        } catch (error) {
          return {
            found: false,
            gameName: summoner.gameName,
            tagLine: summoner.tagLine,
            region: summoner.region,
            error: "Failed to fetch summoner data",
          };
        }
      })
    );

    return NextResponse.json({ players: results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error in multi-search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
