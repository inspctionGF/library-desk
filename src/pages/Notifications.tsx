import { useState } from 'react';
import { Bell, CheckCircle2, Clock, BookX, ClipboardCheck, CheckSquare, Trash2, Filter } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useLibraryStore, type Notification, type NotificationType } from '@/hooks/useLibraryStore';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/dashboard/StatCard';

const notificationIcons = {
  task: CheckSquare,
  overdue_loan: Clock,
  book_issue: BookX,
  inventory: ClipboardCheck,
  system: Bell,
};

const notificationColors = {
  task: 'text-accent',
  overdue_loan: 'text-destructive',
  book_issue: 'text-warning',
  inventory: 'text-primary',
  system: 'text-muted-foreground',
};

const notificationBgColors = {
  task: 'bg-accent/10',
  overdue_loan: 'bg-destructive/10',
  book_issue: 'bg-warning/10',
  inventory: 'bg-primary/10',
  system: 'bg-muted',
};

const typeLabels: Record<NotificationType, string> = {
  task: 'Tâche',
  overdue_loan: 'Prêt en retard',
  book_issue: 'Problème livre',
  inventory: 'Inventaire',
  system: 'Système',
};

export default function Notifications() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  
  const { 
    notifications, 
    getUnreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications 
  } = useLibraryStore();

  const unreadCount = getUnreadNotificationsCount();

  const filteredNotifications = notifications.filter(n => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (readFilter === 'unread' && n.read) return false;
    if (readFilter === 'read' && !n.read) return false;
    return true;
  });

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    tasks: notifications.filter(n => n.type === 'task').length,
    overdueLoans: notifications.filter(n => n.type === 'overdue_loan').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">Gérez vos alertes et notifications</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllNotificationsAsRead()}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Tout marquer lu
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearAllNotifications()}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Tout effacer
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="Total" 
            value={stats.total} 
            icon={<Bell className="h-4 w-4" />}
          />
          <StatCard 
            title="Non lues" 
            value={stats.unread} 
            icon={<Bell className="h-4 w-4" />}
          />
          <StatCard 
            title="Tâches" 
            value={stats.tasks} 
            icon={<CheckSquare className="h-4 w-4" />}
          />
          <StatCard 
            title="Prêts en retard" 
            value={stats.overdueLoans} 
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="task">Tâches</SelectItem>
                    <SelectItem value="overdue_loan">Prêts en retard</SelectItem>
                    <SelectItem value="book_issue">Problèmes livres</SelectItem>
                    <SelectItem value="inventory">Inventaire</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={readFilter} onValueChange={setReadFilter}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="unread">Non lues</SelectItem>
                    <SelectItem value="read">Lues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Aucune notification</p>
                <p className="text-sm mt-1">Vous n'avez aucune notification correspondant aux filtres</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div className={cn("mt-1 p-2 rounded-lg", notificationBgColors[notification.type])}>
                        <Icon className={cn("h-4 w-4", notificationColors[notification.type])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn("text-sm", !notification.read && "font-medium")}>
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {typeLabels[notification.type]}
                            </Badge>
                            {!notification.read && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                          <div className="flex items-center gap-1">
                            {notification.link && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => handleNotificationClick(notification)}
                              >
                                Voir
                              </Button>
                            )}
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                Marquer lu
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-destructive hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
