"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Sword, Skull, Eye, Clock, Coins, Zap } from "lucide-react";
import { Match, formatDate, getChampionIconUrl } from "@/lib/data";
import Image from "next/image";

interface RecordItem {
  id: string;
  type: "kills" | "deaths" | "assists" | "cs" | "gold" | "damage" | "vision" | "kda";
  value: number | string;
  match: Match;
  championId: number;
  championName: string;
  date: string;
}

interface RecordViewProps {
  records: RecordItem[];
}

const recordIcons: Record<string, typeof Target> = {
  kills: Sword,
  deaths: Skull,
  assists: Target,
  cs: Clock,
  gold: Coins,
  damage: Zap,
  vision: Eye,
  kda: Target,
};

const recordLabels: Record<string, string> = {
  kills: "Most Kills",
  deaths: "Most Deaths",
  assists: "Most Assists",
  cs: "Highest CS",
  gold: "Most Gold",
  damage: "Most Damage",
  vision: "Highest Vision",
  kda: "Best KDA",
};

export function RecordView({ records }: RecordViewProps) {
  if (records.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 p-8 text-center">
        <p className="text-slate-400">No records available</p>
      </Card>
    );
  }

  // Group records by type
  const recordsByType = records.reduce((acc, record) => {
    if (!acc[record.type]) acc[record.type] = [];
    acc[record.type].push(record);
    return acc;
  }, {} as Record<string, RecordItem[]>);

  return (
    <div className="space-y-4">
      {Object.entries(recordsByType).map(([type, typeRecords]) => {
        const Icon = recordIcons[type] || Target;
        return (
          <div key={type}>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {recordLabels[type] || type}
            </h3>
            <div className="space-y-2">
              {typeRecords.slice(0, 3).map((record) => (
                <Card
                  key={record.id}
                  className="bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex items-center gap-3 p-3">
                    {/* Champion Icon */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                      <Image
                        src={getChampionIconUrl(record.championId)}
                        alt={record.championName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Record Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">
                          {record.value}
                        </span>
                        <span className="text-sm text-slate-400">
                          {record.championName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatDate(record.date)}
                      </p>
                    </div>

                    {/* Place Badge */}
                    <Badge
                      variant="secondary"
                      className={`
                        ${typeRecords.indexOf(record) === 0 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : ""}
                        ${typeRecords.indexOf(record) === 1 ? "bg-slate-400/20 text-slate-300 border-slate-400/30" : ""}
                        ${typeRecords.indexOf(record) === 2 ? "bg-amber-700/20 text-amber-600 border-amber-700/30" : ""}
                      `}
                    >
                      #{typeRecords.indexOf(record) + 1}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
