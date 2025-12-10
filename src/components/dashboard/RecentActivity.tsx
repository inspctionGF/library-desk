import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  bookTitle: string;
  participantName: string;
  loanDate: string;
  status: 'active' | 'returned' | 'overdue';
  returnDate: string | null;
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityConfig = {
  active: { label: 'Borrowed', variant: 'primary' as const },
  returned: { label: 'Returned', variant: 'success' as const },
  overdue: { label: 'Overdue', variant: 'destructive' as const },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const config = activityConfig[activity.status];
              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{activity.bookTitle}</span>
                    <span className="text-xs text-muted-foreground">{activity.participantName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium border-0",
                        config.variant === 'primary' && 'bg-primary/10 text-primary',
                        config.variant === 'success' && 'bg-success/10 text-success',
                        config.variant === 'destructive' && 'bg-destructive/10 text-destructive'
                      )}
                    >
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {new Date(activity.returnDate || activity.loanDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}