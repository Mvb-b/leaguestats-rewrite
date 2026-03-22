/**
 * POST /api/match/history
 * Obtiene lista de matches desde Riot API si no están en DB
 * Guarda en DB (Match, MatchPlayer, etc.)
 * Input: { puuid: string, region: string, count?: number }
 * Retorna: matches con paginación
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getRiotClient,
  isValidRegion,
  Region as RiotRegion,
} from "@/lib/riot-api";
import {
  getSummonerMatches,
  getOrCreateMatch,
} from "@/lib/db";

const requestSchema = z.object({
  puuid: z.string().uuid(),
  region: z.string().min(2).max(10),
  count: z.number().min(1).max(100).default(20),
  page: z.number().min(0).default(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { puuid, region, count, page } = requestSchema.parse(body);

    if (!isValidRegion(region)) {
      return NextResponse.json(
        { error: "Invalid region" },
        { status: 400 }
      );
    }

    // Check if we need to fetch from Riot API
    const dbMatches = await getSummonerMatches(puuid, page * count, count);

    // If we don't have enough matches in DB, fetch from Riot API
    if (dbMatches.matches.length < count) {
      const riotClient = getRiotClient();

      // Fetch match IDs from Riot API
      const matchIds = await riotClient.getMatchIdsByPuuid(
        puuid,
        region as RiotRegion,
        count + 5, // Fetch a few extra
        page * count
      );

      // Fetch and store missing matches
      for (const matchId of matchIds) {
        try {
          const matchData = await riotClient.getMatch(matchId, region as RiotRegion);
          await getOrCreateMatch(matchId, matchData, region);
        } catch (err) {
          console.warn(`Failed to fetch match ${matchId}:`, err);
        }
      }

      // Re-fetch from DB after storing new matches
      const refreshed = await getSummonerMatches(puuid, page * count, count);

      return NextResponse.json({
        matches: refreshed.matches,
        total: refreshed.total,
        page,
        count,
        hasMore: (page + 1) * count < refreshed.total,
      });
    }

    // Return matches from DB
    return NextResponse.json({
      matches: dbMatches.matches,
      total: dbMatches.total,
      page,
      count,
      hasMore: (page + 1) * count < dbMatches.total,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching match history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
