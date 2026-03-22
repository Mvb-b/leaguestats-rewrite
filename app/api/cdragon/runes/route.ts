/**
 * GET /api/cdragon/runes
 * Cachea datos de runas desde Community Dragon
 * Retorna: lista de runas para select
 */

import { NextRequest, NextResponse } from "next/server";

const CDRAGON_URL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/";

let runesCache: any = null;
let cacheTime: number = 0;
const CACHE_DURATION = 3600000; // 1 hour

async function fetchRunes() {
  const response = await fetch(`${CDRAGON_URL}perks.json`);
  if (!response.ok) {
    throw new Error("Failed to fetch runes");
  }
  return response.json();
}

async function fetchRuneStyles() {
  const response = await fetch(`${CDRAGON_URL}perkstyles.json`);
  if (!response.ok) {
    throw new Error("Failed to fetch rune styles");
  }
  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    // Check cache
    if (runesCache && Date.now() - cacheTime < CACHE_DURATION) {
      return NextResponse.json(runesCache);
    }

    // Fetch fresh data
    const [runes, styles] = await Promise.all([
      fetchRunes(),
      fetchRuneStyles(),
    ]);

    // Format response
    const formattedRunes = {
      runes: runes.map((rune: any) => ({
        id: rune.id,
        key: rune.name,
        name: rune.name,
        icon: `https://raw.communitydragon.org/latest/game/assets/perks/${rune.iconPath.replace(/^\/assets\//, "")}`,
        shortDesc: rune.shortDesc || "",
        longDesc: rune.longDesc || "",
      })),
      styles: styles.styles?.map((style: any) => ({
        id: style.id,
        key: style.name,
        name: style.name,
        icon: `https://raw.communitydragon.org/latest/game/assets/perks/styles/${style.iconPath.replace(/^\/assets\//, "")}`,
        slots: style.slots?.map((slot: any) => ({
          runes: slot.runes?.map((rune: any) => ({
            id: rune.id,
            key: rune.name,
            name: rune.name,
            icon: `https://raw.communitydragon.org/latest/game/assets/perks/${rune.iconPath.replace(/^\/assets\//, "")}`,
          })) || [],
        })) || [],
      })) || [],
      lastUpdated: new Date().toISOString(),
    };

    // Update cache
    runesCache = formattedRunes;
    cacheTime = Date.now();

    return NextResponse.json(formattedRunes);
  } catch (error) {
    console.error("Error fetching runes:", error);
    return NextResponse.json(
      { error: "Failed to fetch runes" },
      { status: 500 }
    );
  }
}
