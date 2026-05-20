import { cn } from '@/utils/pokemon';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer rounded-xl bg-white/5 animate-pulse',
        className,
      )}
    />
  );
}

export function PokemonCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <Skeleton className="h-3 w-1/3 mx-auto" />
      <Skeleton className="h-5 w-2/3 mx-auto" />
      <div className="flex gap-2 justify-center">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function PokemonDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div className="glass-card rounded-3xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="glass-card rounded-3xl p-8 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-2 flex-1 rounded-full" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
