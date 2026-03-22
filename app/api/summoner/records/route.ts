/**
 * POST /api/summoner/records
 * Records personales (mejor kda, más kills, etc.)
 * Input: { puuid: string, region: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidRegion } from "@/lib/riot-api";
import { getSummonerRecords } from "@/lib/db";

const requestSchema = z.object({
  puuid: z.string().uuid(),
  region: z.string().min(2).max(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { puuid, region } = requestSchema.parse(body);

    if (!isValidRegion(region)) {
      return NextResponse.json(
        { error: "Invalid region" },
        { status: 400 }
      );
    }

    const records = await getSummonerRecords(puuid);

    if (!records) {
      return NextResponse.json({
        error: "No matches found for this summoner",
      }, { status: 404 });
    }

    const formatRecord = (record: any) => ({
      value: record.kills ?? record.kda ?? record.totalDamageDealtToChampions ??
             record.cs ?? record.csPerMinute ?? record.goldEarned ?? record.visionScore ?? 0,
      matchId: record.match?.matchId,
      date: record.match?.gameCreation,
      championName: record.championName,
      championId: record.championId,
      kills: record.kills,
      deaths: record.deaths,
      assists: record.assists,
      kda: record.kda,
    });

    return NextResponse.json({
      records: {
        mostKills: formatRecord(records.mostKills),
        bestKda: formatRecord(records.bestKda),
        mostDamage: formatRecord(records.mostDamage),
        mostCs: formatRecord(records.mostCs),
        highestCsPerMin: formatRecord(records.highestCsPerMin),
        mostGold: formatRecord(records.mostGold),
        mostVisionScore: formatRecord(records.mostVisionScore),
        longestWinStreak: records.longestWinStreak,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching records:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
