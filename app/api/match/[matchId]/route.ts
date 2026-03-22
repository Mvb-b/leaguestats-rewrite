/**
 * GET /api/match/:matchId
 * Retorna: datos completos de una partida
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findMatchById } from "@/lib/db";

const paramsSchema = z.object({
  matchId: z.string().min(10),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = paramsSchema.parse(await params);

    const match = await findMatchById(matchId);

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    // Format response
    const formattedMatch = {
      matchId: match.matchId,
      gameCreation: match.gameCreation,
      gameDuration: match.gameDuration,
      gameMode: match.gameMode,
      gameType: match.gameType,
      queueId: match.queueId,
      mapId: match.mapId,
      patch: match.patch,
      season: match.season,
      region: match.region,
      teams: match.teams.map((t) => ({
        teamId: t.teamId,
        win: t.win,
        stats: {
          towerKills: t.towerKills,
          inhibitorKills: t.inhibitorKills,
          baronKills: t.baronKills,
          dragonKills: t.dragonKills,
          riftHeraldKills: t.riftHeraldKills,
        },
        bans: t.bans,
      })),
      players: match.players.map((p) => ({
        puuid: p.puuid,
        summonerName: p.summonerName,
        championId: p.championId,
        championName: p.championName,
        championLevel: p.championLevel,
        teamId: p.teamId,
        win: p.win,
        stats: {
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
          kda: p.kda,
          kp: p.kp,
          cs: p.cs,
          csPerMinute: p.csPerMinute,
          goldEarned: p.goldEarned,
          goldPerMinute: p.goldPerMinute,
          totalDamageDealt: p.totalDamageDealt,
          totalDamageDealtToChampions: p.totalDamageDealtToChampions,
          damageSelfMitigated: p.damageSelfMitigated,
          totalHeal: p.totalHeal,
          visionScore: p.visionScore,
          wardsPlaced: p.wardsPlaced,
          wardsKilled: p.wardsKilled,
          doubleKills: p.doubleKills,
          tripleKills: p.tripleKills,
          quadraKills: p.quadraKills,
          pentaKills: p.pentaKills,
        },
        items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
        runes: {
          primaryPath: p.primaryRunePath,
          primaryRune: p.primaryRune,
          secondaryPath: p.secondaryRunePath,
        },
        summoner: p.summoner ? {
          gameName: p.summoner.gameName,
          tagLine: p.summoner.tagLine,
          profileIconId: p.summoner.profileIconId,
        } : null,
      })),
      createdAt: match.createdAt,
    };

    return NextResponse.json(formattedMatch);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid matchId" },
        { status: 400 }
      );
    }

    console.error("Error fetching match:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
