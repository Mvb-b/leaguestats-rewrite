import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidRegion } from "@/lib/riot-api";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  puuid: z.string().uuid(),
  region: z.string().min(2).max(10),
  year: z.number().min(2020).max(2030),
});

function getQueueName(queueId: number): string {
  const queues: Record<number, string> = {
    420: "Ranked Solo",
    440: "Ranked Flex",
    400: "Draft Pick",
    430: "Blind Pick",
    450: "ARAM",
    700: "Clash",
  };
  return queues[queueId] || `Queue ${queueId}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { puuid, region, year } = requestSchema.parse(body);

    if (!isValidRegion(region)) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    }

    const startDate = new Date(`${year}-01-01T00:00:00Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);

    const matches = await prisma.matchPlayer.findMany({
      where: {
        summonerPuuid: puuid,
        match: {
          gameCreation: { gte: startDate, lt: endDate },
        },
      },
      orderBy: { match: { gameCreation: "desc" } },
      include: {
        match: {
          select: {
            matchId: true,
            gameCreation: true,
            gameDuration: true,
            gameMode: true,
            queueId: true,
            patch: true,
          },
        },
      },
    });

    if (matches.length === 0) {
      return NextResponse.json({ year, hasData: false });
    }

    const wins = matches.filter((m) => m.win).length;
    const totalDuration = matches.reduce((sum, m) => sum + m.match.gameDuration, 0);
    const hoursPlayed = Math.round((totalDuration / 3600) * 10) / 10;

    const totalKills = matches.reduce((sum, m) => sum + m.kills, 0);
    const totalDeaths = matches.reduce((sum, m) => sum + m.deaths, 0);
    const totalAssists = matches.reduce((sum, m) => sum + m.assists, 0);
    const avgKda = totalDeaths > 0 ? Math.round(((totalKills + totalAssists) / totalDeaths) * 100) / 100 : 0;

    const totalDamage = matches.reduce((sum, m) => sum + m.totalDamageDealtToChampions, 0);
    const totalGold = matches.reduce((sum, m) => sum + m.goldEarned, 0);
    const totalCS = matches.reduce((sum, m) => sum + m.cs, 0);

    const avgDamage = Math.round(totalDamage / matches.length);
    const avgGold = Math.round(totalGold / matches.length);
    const avgCS = Math.round(totalCS / matches.length);

    // Champion stats
    const championMap = new Map();
    for (const match of matches) {
      const existing = championMap.get(match.championId);
      if (existing) {
        existing.games++;
        if (match.win) existing.wins++;
        existing.kills += match.kills;
        existing.deaths += match.deaths;
        existing.assists += match.assists;
      } else {
        championMap.set(match.championId, {
          championId: match.championId,
          championName: match.championName,
          games: 1,
          wins: match.win ? 1 : 0,
          kills: match.kills,
          deaths: match.deaths,
          assists: match.assists,
        });
      }
    }

    const champions = Array.from(championMap.values())
      .map((c: any) => ({
        ...c,
        winrate: Math.round((c.wins / c.games) * 1000) / 10,
        kda: c.deaths > 0 ? Math.round(((c.kills + c.assists) / c.deaths) * 100) / 100 : 0,
      }))
      .sort((a: any, b: any) => b.games - a.games);

    const mostPlayed = champions[0];
    const bestChampion = champions.filter((c: any) => c.games >= 5).sort((a: any, b: any) => b.winrate - a.winrate)[0];

    // Queue stats
    const queueMap = new Map();
    for (const match of matches) {
      const existing = queueMap.get(match.match.queueId);
      if (existing) {
        existing.games++;
        if (match.win) existing.wins++;
      } else {
        queueMap.set(match.match.queueId, { games: 1, wins: match.win ? 1 : 0 });
      }
    }
    const favoriteQueue = Array.from(queueMap.entries()).sort((a, b) => b[1].games - a[1].games)[0];

    // Monthly stats
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = new Map();
    for (const match of matches) {
      const month = new Date(match.match.gameCreation).getMonth();
      const existing = monthlyMap.get(month);
      if (existing) {
        existing.games++;
        existing.duration += match.match.gameDuration;
      } else {
        monthlyMap.set(month, { games: 1, duration: match.match.gameDuration });
      }
    }
    const mostActiveMonth = Array.from(monthlyMap.entries()).sort((a, b) => b[1].games - a[1].games)[0];

    return NextResponse.json({
      year,
      hasData: true,
      summary: {
        totalGames: matches.length,
        wins,
        losses: matches.length - wins,
        winrate: Math.round((wins / matches.length) * 1000) / 10,
        hoursPlayed,
        daysEquivalent: Math.round((hoursPlayed / 24) * 10) / 10,
        avgKda,
        avgDamageDealt: avgDamage,
        avgCS,
        avgGold,
        mostPlayedChampion: mostPlayed ? { name: mostPlayed.championName, games: mostPlayed.games, winrate: mostPlayed.winrate, kda: mostPlayed.kda } : null,
        bestChampion: bestChampion ? { name: bestChampion.championName, games: bestChampion.games, winrate: bestChampion.winrate } : null,
        favoriteGameMode: getQueueName(favoriteQueue?.[0] || 0),
        mostActiveMonth: mostActiveMonth ? monthNames[mostActiveMonth[0]] : null,
        mostGamesInMonth: mostActiveMonth ? mostActiveMonth[1].games : 0,
        totalDamageDealt: totalDamage,
        totalCS,
        totalGold,
        totalKills,
        totalDeaths,
        totalAssists,
      },
      champions: champions.slice(0, 5),
      monthlyStats: Array.from(monthlyMap.entries())
        .map(([month, stats]) => ({ month: monthNames[month], ...stats }))
        .sort((a: any, b: any) => b.games - a.games),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("Error fetching year review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
