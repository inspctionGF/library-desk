import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";
import { ChartSkeleton } from "./ChartSkeleton";
import { ActivityListSkeleton } from "./ActivityListSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Widgets Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityListSkeleton items={3} />
        <ActivityListSkeleton items={3} />
        <ActivityListSkeleton items={4} />
        <ActivityListSkeleton items={4} />
      </div>
    </div>
  );
}
