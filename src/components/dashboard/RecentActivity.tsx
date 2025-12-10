import { BookOpen, RotateCcw } from 'lucide-react';
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

const statusStyles = {
  active: 'bg-secondary/10 text-secondary border-secondary/30',
  returned: 'bg-muted text-muted-foreground border-muted',
  overdue: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={cn(
                'rounded-lg p-2',
                activity.returnDate ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
              )}>
                {activity.returnDate ? <RotateCcw className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{activity.bookTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.returnDate ? 'Returned by' : 'Borrowed by'} {activity.participantName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.returnDate || activity.loanDate).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className={cn('text-xs', statusStyles[activity.status])}>
                {activity.status}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
