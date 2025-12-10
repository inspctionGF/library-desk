import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OverdueAlertProps {
  count: number;
  onViewOverdue: () => void;
}

export function OverdueAlert({ count, onViewOverdue }: OverdueAlertProps) {
  if (count === 0) return null;

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-destructive/10 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-destructive">
              {count} Overdue {count === 1 ? 'Book' : 'Books'}
            </p>
            <p className="text-sm text-muted-foreground">
              Some books need to be returned
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onViewOverdue}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
