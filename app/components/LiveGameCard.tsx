"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Radio, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface LiveGameParticipant {
  puuid: string;
  summonerName: string;
  teamId: number;
  championId: number;
  profileIconId: number;
  spell1Id: number;
  spell2Id: number;
}

interface LiveGame {
  gameId: number;
  mapId: number;
  gameMode: string;
  gameType: string;
  queueId: number;
  startTime: number;
  participants: LiveGameParticipant[];
}

interface LiveGameData {
  inGame: boolean;
  game: LiveGame | null;
}

interface LiveGameCardProps {
  puuid: string;
  region: string;
  currentSummonerName?: string;
}

const queueNames: Record<number, string> = {
  420: "Ranked Solo",
  440: "Ranked Flex",
  400: "Draft Pick",
  430: "Blind Pick",
  450: "ARAM",
  700: "Clash",
  840: "Bot Intro",
  850: "Bot Beginner",
  1900: "URF",
};

// Mapeo básico de IDs a nombres de campeones
const championMap: Record<number, string> = {
  1: "Annie", 2: "Olaf", 3: "Galio", 4: "TwistedFate", 5: "XinZhao",
  6: "Urgot", 7: "LeBlanc", 8: "Vladimir", 9: "FiddleSticks", 10: "Kayle",
  11: "MasterYi", 12: "Alistar", 13: "Ryze", 14: "Sion", 15: "Sivir",
  16: "Soraka", 17: "Teemo", 18: "Tristana", 19: "Warwick", 20: "Nunu",
  21: "MissFortune", 22: "Ashe", 23: "Tryndamere", 24: "Jax", 25: "Morgana",
  26: "Zilean", 27: "Singed", 28: "Evelynn", 29: "Twitch", 30: "Karthus",
  31: "ChoGath", 32: "Amumu", 33: "Rammus", 34: "Anivia", 35: "Shaco",
  36: "DrMundo", 37: "Sona", 38: "Kassadin", 39: "Irelia", 40: "Janna",
  41: "Gangplank", 42: "Corki", 43: "Karma", 44: "Taric", 45: "Veigar",
  48: "Trundle", 50: "Swain", 51: "Caitlyn", 53: "Blitzcrank", 54: "Malphite",
  55: "Katarina", 56: "Nocturne", 57: "Maokai", 58: "Renekton", 59: "JarvanIV",
  60: "Elise", 61: "Orianna", 62: "Wukong", 63: "Brand", 64: "LeeSin",
  67: "Vayne", 68: "Rumble", 69: "Cassiopeia", 72: "Skarner", 74: "Heimerdinger",
  75: "Nasus", 76: "Nidalee", 77: "Udyr", 78: "Poppy", 79: "Gragas",
  80: "Pantheon", 81: "Ezreal", 82: "Mordekaiser", 83: "Yorick", 84: "Akali",
  85: "Kennen", 86: "Garen", 89: "Leona", 90: "Malzahar", 91: "Talon",
  92: "Riven", 96: "KogMaw", 98: "Shen", 99: "Lux", 101: "Xerath",
  102: "Shyvana", 103: "Ahri", 104: "Graves", 105: "Fizz", 106: "Volibear",
  107: "Rengar", 110: "Varus", 111: "Nautilus", 112: "Viktor", 113: "Sejuani",
  114: "Fiora", 115: "Ziggs", 117: "Lulu", 119: "Draven", 120: "Hecarim",
  121: "Khazix", 122: "Darius", 126: "Jayce", 127: "Lissandra", 131: "Diana",
  133: "Quinn", 134: "Syndra", 136: "AurelionSol", 141: "Kayn", 142: "Zoe",
  143: "Zyra", 145: "Kaisa", 147: "Seraphine", 150: "Gnar", 154: "Zac",
  157: "Yasuo", 161: "Velkoz", 163: "Taliyah", 164: "Jhin", 166: "Akshan",
  201: "Braum", 203: "Kindred", 222: "Jinx", 223: "TahmKench",
  233: "Briar", 234: "Viego", 235: "Senna", 236: "Lucian", 238: "Zed",
  240: "Kled", 245: "Ekko", 246: "Qiyana", 254: "Vi", 266: "Aatrox",
  267: "Nami", 268: "Azir", 350: "Yuumi", 360: "Samira", 412: "Thresh",
  420: "Illaoi", 421: "RekSai", 427: "Ivern", 429: "Kalista", 432: "Bard",
  497: "Rakan", 498: "Xayah", 516: "Sylas", 517: "Neeko", 526: "Rell",
  555: "Pyke", 711: "Vex", 777: "Yone", 875: "Sett", 876: "Lillia",
  887: "Gwen", 888: "Renata", 895: "Nilah", 897: "KSante", 902: "Milio",
  910: "Hwei", 950: "Naafiri", 2000: "Belveth", 2210: "Aurora",
};

const spellMap: Record<number, string> = {
  1: "SummonerBoost", 3: "SummonerExhaust", 4: "SummonerFlash",
  6: "SummonerHaste", 7: "SummonerHeal", 11: "SummonerSmite",
  12: "SummonerTeleport", 14: "SummonerDot", 21: "SummonerBarrier",
};

function getChampionIconUrl(championId: number): string {
  const name = championMap[championId] || "Unknown";
  return `https://ddragon.leagueoflegends.com/cdn/14.5.1/img/champion/${name}.png`;
}

function getSpellIconUrl(spellId: number): string {
  const name = spellMap[spellId] || "SummonerFlash";
  return `https://ddragon.leagueoflegends.com/cdn/14.5.1/img/spell/${name}.png`;
}

function formatGameTime(startTime: number): string {
  const diff = Date.now() - startTime;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function TeamList({ participants, currentName }: { participants: LiveGameParticipant[]; currentName?: string }) {
  return (
    <div className="space-y-2">
      {participants.map((p) => {
        const isCurrent = p.summonerName === currentName;
        return (
          <div
            key={p.puuid}
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
              isCurrent ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-slate-800/30"
            }`}
          >
            <Avatar className="h-8 w-8 border border-slate-600">
              <AvatarImage src={getChampionIconUrl(p.championId)} alt="" />
              <AvatarFallback className="bg-slate-700 text-xs">{p.summonerName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isCurrent ? "text-emerald-400" : "text-slate-200"}`}>
                {p.summonerName}
              </p>
            </div>
            <div className="flex gap-1">
              <img
                src={getSpellIconUrl(p.spell1Id)}
                alt=""
                className="w-4 h-4 rounded"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <img
                src={getSpellIconUrl(p.spell2Id)}
                alt=""
                className="w-4 h-4 rounded"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LiveGameCard({ puuid, region, currentSummonerName }: LiveGameCardProps) {
  const [elapsedTime, setElapsedTime] = useState<string>("0:00");

  const { data, isLoading } = useQuery<LiveGameData>({
    queryKey: ["live-game", puuid, region],
    queryFn: async () => {
      const res = await fetch(`/api/summoner/live/${puuid}?region=${region}`);
      if (!res.ok) throw new Error("Failed to fetch live game");
      return res.json();
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    staleTime: 25000,
    enabled: !!puuid && !!region,
  });

  useEffect(() => {
    if (!data?.game?.startTime) return;
    const interval = setInterval(() => {
      setElapsedTime(formatGameTime(data.game!.startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.game?.startTime]);

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="ml-2 text-slate-400">Checking live game...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.inGame || !data.game) return null;

  const { game } = data;
  const blueTeam = game.participants.filter((p) => p.teamId === 100);
  const redTeam = game.participants.filter((p) => p.teamId === 200);
  const queueName = queueNames[game.queueId] || game.gameMode;

  return (
    <Card className="bg-gradient-to-br from-emerald-950/50 via-slate-900/50 to-slate-900/50 border-emerald-500/30 overflow-hidden mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="text-lg font-bold text-white">Live Game</h3>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {queueName}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-emerald-400 font-mono">{elapsedTime}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-4">
          {/* Blue Team */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm font-semibold text-blue-400">Blue Team</span>
            </div>
            <TeamList participants={blueTeam} currentName={currentSummonerName} />
          </div>
          {/* Red Team */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm font-semibold text-red-400">Red Team</span>
            </div>
            <TeamList participants={redTeam} currentName={currentSummonerName} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
