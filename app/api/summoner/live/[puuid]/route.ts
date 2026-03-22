/**
 * GET /api/summoner/live/:puuid
 * Chequea si hay partida en vivo
 * Retorna: datos de partida live o null
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRiotClient, isValidRegion, Region as RiotRegion } from "@/lib/riot-api";

const paramsSchema = z.object({
  puuid: z.string(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { puuid: string } }
) {
  try {
    const { puuid } = paramsSchema.parse(await params);

    // Get region from query params
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region");

    if (!region || !isValidRegion(region)) {
      return NextResponse.json(
        { error: "Invalid or missing region" },
        { status: 400 }
      );
    }

    const riotClient = getRiotClient();
    const activeGame = await riotClient.getActiveGame(
      puuid,
      region as RiotRegion
    );

    if (!activeGame) {
      return NextResponse.json({
        inGame: false,
        game: null,
      });
    }

    // Format response
    const formattedGame = {
      gameId: activeGame.gameId,
      mapId: activeGame.mapId,
      gameMode: activeGame.gameMode,
      gameType: activeGame.gameType,
      queueId: activeGame.gameQueueConfigId,
      startTime: Date.now(),
      participants: activeGame.participants.map((p) => ({
        puuid: p.puuid,
        summonerName: p.summonerName,
        teamId: p.teamId,
        championId: p.championId,
        profileIconId: p.profileIconId,
        spell1Id: p.spell1Id,
        spell2Id: p.spell2Id,
      })),
    };

    return NextResponse.json({
      inGame: true,
      game: formattedGame,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid PUUID" },
        { status: 400 }
      );
    }

    console.error("Error fetching live game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
