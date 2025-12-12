import { useState } from 'react';
import { Plus, Search, Filter, CheckCircle2, Circle, Clock, MoreHorizontal, Edit, Trash2, Calendar } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { DeleteTaskDialog } from '@/components/tasks/DeleteTaskDialog';
import { useLibraryStore, Task } from '@/hooks/useLibraryStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitialLoading } from '@/hooks/useLoadingState';
import { TasksPageSkeleton } from '@/components/skeletons';

const priorityConfig = {
  low: { label: 'Basse', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Moyenne', color: 'bg-accent/10 text-accent' },
  high: { label: 'Haute', color: 'bg-destructive/10 text-destructive' },
};

const statusConfig = {
  todo: { label: 'À faire', icon: Circle, color: 'text-muted-foreground' },
  in_progress: { label: 'En cours', icon: Clock, color: 'text-accent' },
  completed: { label: 'Terminée', icon: CheckCircle2, color: 'text-success' },
};

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus, getTaskStats } = useLibraryStore();
  const { toast } = useToast();
  const isLoading = useInitialLoading(400);
  const stats = getTaskStats();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  if (isLoading) {
    return (
      <AdminLayout>
        <TasksPageSkeleton />
      </AdminLayout>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAdd = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      toast({ title: 'Tâche modifiée', description: `"${data.title}" a été mise à jour.` });
    } else {
      addTask(data);
      toast({ title: 'Tâche créée', description: `"${data.title}" a été ajoutée.` });
    }
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      toast({ title: 'Tâche supprimée', description: `"${taskToDelete.title}" a été supprimée.` });
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleToggleComplete = (task: Task) => {
    toggleTaskStatus(task.id);
    toast({
      title: task.status === 'completed' ? 'Tâche réouverte' : 'Tâche terminée',
      description: `"${task.title}" a été ${task.status === 'completed' ? 'réouverte' : 'marquée comme terminée'}.`,
    });
  };

  const isOverdue = (task: Task) => {
    if (task.status === 'completed' || !task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Tâches</h1>
            <p className="text-sm text-muted-foreground">
              {stats.completed}/{stats.total} terminées • {stats.highPriority} prioritaires
            </p>
          </div>
          <Button onClick={handleAdd} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle tâche
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Circle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.todo}</p>
                <p className="text-xs text-muted-foreground">À faire</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">En cours</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Terminées</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Calendar className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">En retard</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une tâche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 bg-card border-border"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9 border-border">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="todo">À faire</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px] h-9 border-border">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="low">Basse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <Card className="bg-card border border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Aucune tâche trouvée.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => {
              const StatusIcon = statusConfig[task.status].icon;
              const taskIsOverdue = isOverdue(task);

              return (
                <Card 
                  key={task.id} 
                  className={cn(
                    "bg-card border border-border shadow-sm hover:shadow-md transition-shadow",
                    task.status === 'completed' && "opacity-60"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={() => handleToggleComplete(task)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className={cn(
                              "font-medium text-foreground",
                              task.status === 'completed' && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className={cn("text-xs border-0", priorityConfig[task.priority].color)}>
                                {priorityConfig[task.priority].label}
                              </Badge>
                              <Badge variant="outline" className={cn("text-xs border-0 flex items-center gap-1", statusConfig[task.status].color)}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig[task.status].label}
                              </Badge>
                              {task.dueDate && (
                                <span className={cn(
                                  "text-xs flex items-center gap-1",
                                  taskIsOverdue ? "text-destructive" : "text-muted-foreground"
                                )}>
                                  <Calendar className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                  {taskIsOverdue && " (en retard)"}
                                </span>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg">
                              <DropdownMenuItem onClick={() => handleEdit(task)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(task)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Dialogs */}
      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        onSubmit={handleFormSubmit}
      />
      <DeleteTaskDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        task={taskToDelete}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}