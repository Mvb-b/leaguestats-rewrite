/**
 * POST /api/summoner/basic
 * Busca datos básicos de un summoner
 * Input: { summoner: string, region: string }
 * Busca en DB primero, si no existe, llama Riot API
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getRiotClient,
  isValidRegion,
  Region as RiotRegion,
} from "@/lib/riot-api";
import {
  findSummonerByName,
  findSummonerByPuuid,
  createOrUpdateSummoner,
} from "@/lib/db";

const requestSchema = z.object({
  summoner: z.string().min(1).max(50),
  region: z.string().min(2).max(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summoner, region } = requestSchema.parse(body);

    if (!isValidRegion(region)) {
      return NextResponse.json(
        { error: "Invalid region" },
        { status: 400 }
      );
    }

    // Parse summoner name (gameName#tagLine or just gameName with #EUW tag)
    const summonerParts = summoner.split("#");
    let gameName = summonerParts[0];
    let tagLine = summonerParts[1] || region.toUpperCase();

    // Check database first
    let dbSummoner = await findSummonerByName(gameName, tagLine, region);

    // If not found or stale (>1 hour), fetch from Riot API
    const isStale =
      dbSummoner &&
      new Date().getTime() - dbSummoner.lastUpdatedAt.getTime() > 3600000;

    if (!dbSummoner || isStale) {
      const riotClient = getRiotClient();

      // Fetch account and summoner data
      const account = await riotClient.getAccountByRiotId(
        gameName,
        tagLine,
        region as RiotRegion
      );
      const summonerData = await riotClient.getSummonerByPuuid(
        account.puuid,
        region as RiotRegion
      );

      // Save to DB
      dbSummoner = await createOrUpdateSummoner(
        account,
        summonerData,
        region
      );
    }

    return NextResponse.json({
      puuid: dbSummoner.puuid,
      gameName: dbSummoner.gameName,
      tagLine: dbSummoner.tagLine,
      summonerLevel: dbSummoner.summonerLevel,
      profileIconId: dbSummoner.profileIconId,
      revisionDate: dbSummoner.revisionDate,
      region: dbSummoner.region,
      lastUpdatedAt: dbSummoner.lastUpdatedAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      (error.message.includes("not found") || error.message.includes("404"))
    ) {
      return NextResponse.json(
        { error: "Summoner not found" },
        { status: 404 }
      );
    }

    console.error("Error fetching summoner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
