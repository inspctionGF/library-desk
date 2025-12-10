import { BookOpen, Users, BookCopy, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { OverdueAlert } from '@/components/dashboard/OverdueAlert';
import { useLibraryStore } from '@/hooks/useLibraryStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { getStats, getRecentActivity } = useLibraryStore();
  const stats = getStats();
  const recentActivity = getRecentActivity();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        {/* Overdue Alert */}
        <OverdueAlert 
          count={stats.overdueLoans} 
          onViewOverdue={() => navigate('/loans?filter=overdue')} 
        />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Books"
            value={stats.totalBooks}
            subtitle="vs last month"
            trend={{ value: '+3 books', positive: true }}
          />
          <StatCard
            title="Active Loans"
            value={stats.activeLoans}
            subtitle="vs last month"
            trend={{ value: `${stats.overdueLoans} overdue`, positive: false }}
          />
          <StatCard
            title="Participants"
            value={stats.totalParticipants}
            subtitle="Registered students"
            trend={{ value: '+7%', positive: true }}
          />
          <StatCard
            title="This Week"
            value={stats.booksThisWeek}
            subtitle="Books borrowed"
            trend={{ value: '+5%', positive: true }}
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <QuickActions
              onAddBook={() => navigate('/books?action=add')}
              onNewLoan={() => navigate('/loans?action=new')}
              onAddParticipant={() => navigate('/participants?action=add')}
            />
          </div>
          <div className="lg:col-span-2">
            <RecentActivity activities={recentActivity} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}