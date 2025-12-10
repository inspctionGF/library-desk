import { CheckCircle2, Circle, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Task } from '@/hooks/useLibraryStore';

interface TaskWidgetProps {
  tasks: Task[];
  onToggleTask: (task: Task) => void;
  onViewAll: () => void;
}

const priorityConfig = {
  low: { label: 'Basse', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Moyenne', color: 'bg-accent/10 text-accent' },
  high: { label: 'Haute', color: 'bg-destructive/10 text-destructive' },
};

const statusConfig = {
  todo: { icon: Circle, color: 'text-muted-foreground' },
  in_progress: { icon: Clock, color: 'text-accent' },
  completed: { icon: CheckCircle2, color: 'text-success' },
};

export function TaskWidget({ tasks, onToggleTask, onViewAll }: TaskWidgetProps) {
  const isOverdue = (task: Task) => {
    if (task.status === 'completed' || !task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium text-foreground">Tâches prioritaires</CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs text-muted-foreground hover:text-foreground gap-1">
          Voir tout
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune tâche en attente
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const taskIsOverdue = isOverdue(task);
              return (
                <div 
                  key={task.id} 
                  className="flex items-start gap-3 py-2 border-b border-border last:border-0"
                >
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={() => onToggleTask(task)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium text-foreground line-clamp-1",
                      task.status === 'completed' && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-0", priorityConfig[task.priority].color)}>
                        {priorityConfig[task.priority].label}
                      </Badge>
                      {task.dueDate && (
                        <span className={cn(
                          "text-[10px] flex items-center gap-1",
                          taskIsOverdue ? "text-destructive" : "text-muted-foreground"
                        )}>
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
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