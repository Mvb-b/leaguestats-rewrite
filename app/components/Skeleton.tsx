"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "default" | "circle" | "card";
}

export function Skeleton({ 
  className, 
  width, 
  height,
  variant = "default" 
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-slate-800";
  
  const variantClasses = {
    default: "rounded-md",
    circle: "rounded-full",
    card: "rounded-xl",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

// Predefined skeleton layouts
export function SummonerHeaderSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar Skeleton */}
        <Skeleton variant="circle" width={96} height={96} />
        
        {/* Info Skeleton */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Skeleton width={150} height={32} />
            <Skeleton width={80} height={28} />
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Skeleton width={60} height={24} />
            <Skeleton width={100} height={24} />
            <Skeleton width={80} height={24} />
            <Skeleton width={70} height={24} />
          </div>
        </div>
        
        {/* Stats Skeleton */}
        <div className="text-right space-y-2">
          <Skeleton width={80} height={20} />
          <Skeleton width={100} height={28} />
          <Skeleton width={60} height={16} />
        </div>
      </div>
    </div>
  );
}

export function ChampionStatsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-4">
            {/* Champion Image Skeleton */}
            <Skeleton variant="circle" width={48} height={48} />
            
            {/* Champion Info Skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton width={100} height={20} />
                <Skeleton width={60} height={20} />
              </div>
              <Skeleton width="100%" height={8} />
            </div>
            
            {/* KDA Skeleton */}
            <div className="text-right min-w-[80px] space-y-1">
              <Skeleton width={40} height={16} />
              <Skeleton width={60} height={20} />
              <Skeleton width={50} height={16} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MatchListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-4">
            {/* Result indicator skeleton */}
            <Skeleton width={4} height={60} className="rounded-full" />
            
            {/* Champion skeleton */}
            <Skeleton variant="circle" width={48} height={48} />
            
            {/* Score skeleton */}
            <div className="flex-1 space-y-2">
              <Skeleton width={80} height={24} />
              <Skeleton width={60} height={16} />
            </div>
            
            {/* Items skeleton */}
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} width={32} height={32} className="rounded" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
