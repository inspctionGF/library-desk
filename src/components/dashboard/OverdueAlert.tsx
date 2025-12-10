import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OverdueAlertProps {
  count: number;
  onViewOverdue: () => void;
}

export function OverdueAlert({ count, onViewOverdue }: OverdueAlertProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {count} book{count !== 1 ? 's' : ''} overdue
          </p>
          <p className="text-xs text-muted-foreground">
            Review and send reminders to participants
          </p>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onViewOverdue}
        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        View Overdue
      </Button>
    </div>
  );
}