import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityListSkeletonProps {
  items?: number;
  showHeader?: boolean;
}

export function ActivityListSkeleton({ items = 4, showHeader = true }: ActivityListSkeletonProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {Array.from({ length: items }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
