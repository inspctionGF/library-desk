import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { OverdueAlert } from '@/components/dashboard/OverdueAlert';
import { TaskWidget } from '@/components/dashboard/TaskWidget';
import { WeeklyLoansChart } from '@/components/dashboard/WeeklyLoansChart';
import { CategoryDistributionChart } from '@/components/dashboard/CategoryDistributionChart';
import { MonthlyBooksChart } from '@/components/dashboard/MonthlyBooksChart';
import { BookIssuesWidget } from '@/components/dashboard/BookIssuesWidget';
import { useLibraryStore } from '@/hooks/useLibraryStore';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getStats, getRecentActivity, getUpcomingTasks, toggleTaskStatus, getTaskStats } = useLibraryStore();
  const stats = getStats();
  const taskStats = getTaskStats();
  const recentActivity = getRecentActivity();
  const upcomingTasks = getUpcomingTasks(4);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleToggleTask = (task: { id: string; title: string; status: string }) => {
    toggleTaskStatus(task.id);
    toast({
      title: task.status === 'completed' ? 'Tâche réouverte' : 'Tâche terminée',
      description: `"${task.title}" a été ${task.status === 'completed' ? 'réouverte' : 'marquée comme terminée'}.`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground capitalize">{today}</p>
        </div>

        {/* Overdue Alert */}
        <OverdueAlert 
          count={stats.overdueLoans} 
          onViewOverdue={() => navigate('/loans?filter=overdue')} 
        />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Livres"
            value={stats.totalBooks}
            subtitle="vs mois dernier"
            trend={{ value: '+3 livres', positive: true }}
          />
          <StatCard
            title="Prêts actifs"
            value={stats.activeLoans}
            subtitle="vs mois dernier"
            trend={{ value: `${stats.overdueLoans} en retard`, positive: false }}
          />
          <StatCard
            title="Participants"
            value={stats.totalParticipants}
            subtitle="Élèves inscrits"
            trend={{ value: '+7%', positive: true }}
          />
          <StatCard
            title="Tâches"
            value={`${taskStats.completed}/${taskStats.total}`}
            subtitle="Terminées"
            trend={{ value: `${taskStats.highPriority} prioritaires`, positive: taskStats.highPriority === 0 }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <WeeklyLoansChart />
          <CategoryDistributionChart />
          <MonthlyBooksChart />
        </div>

        {/* Quick Actions, Issues, Tasks & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-4">
          <div>
            <QuickActions
              onAddBook={() => navigate('/books?action=add')}
              onNewLoan={() => navigate('/loans?action=new')}
              onAddParticipant={() => navigate('/participants?action=add')}
            />
          </div>
          <div>
            <BookIssuesWidget onViewAll={() => navigate('/book-issues')} />
          </div>
          <div>
            <TaskWidget 
              tasks={upcomingTasks} 
              onToggleTask={handleToggleTask}
              onViewAll={() => navigate('/tasks')}
            />
          </div>
          <div>
            <RecentActivity activities={recentActivity} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}