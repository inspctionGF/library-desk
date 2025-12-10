import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Search, Calendar, MoreHorizontal, Pencil, Trash2, Tag, CalendarDays } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLibraryStore, ExtraActivity, ExtraActivityType } from '@/hooks/useLibraryStore';
import { useToast } from '@/hooks/use-toast';
import { ActivityTypeFormDialog } from '@/components/extra-activities/ActivityTypeFormDialog';
import { ExtraActivityFormDialog } from '@/components/extra-activities/ExtraActivityFormDialog';
import { DeleteActivityDialog } from '@/components/extra-activities/DeleteActivityDialog';

export default function ExtraActivities() {
  const { toast } = useToast();
  const {
    extraActivityTypes,
    extraActivities,
    addExtraActivityType,
    updateExtraActivityType,
    deleteExtraActivityType,
    addExtraActivity,
    updateExtraActivity,
    deleteExtraActivity,
    getExtraActivityTypeById,
  } = useLibraryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Type dialogs
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ExtraActivityType | null>(null);
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null);

  // Activity dialogs
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ExtraActivity | null>(null);
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);

  // Filter activities
  const filteredActivities = extraActivities.filter((activity) => {
    const type = getExtraActivityTypeById(activity.activityTypeId);
    const matchesSearch =
      activity.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || activity.activityTypeId === typeFilter;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Stats
  const totalActivities = extraActivities.length;
  const thisMonthActivities = extraActivities.filter((a) => {
    const activityDate = new Date(a.date);
    const now = new Date();
    return activityDate.getMonth() === now.getMonth() && activityDate.getFullYear() === now.getFullYear();
  }).length;

  // Type handlers
  const handleAddType = () => {
    setEditingType(null);
    setIsTypeDialogOpen(true);
  };

  const handleEditType = (type: ExtraActivityType) => {
    setEditingType(type);
    setIsTypeDialogOpen(true);
  };

  const handleTypeSubmit = (data: Omit<ExtraActivityType, 'id' | 'createdAt'>) => {
    if (editingType) {
      updateExtraActivityType(editingType.id, data);
      toast({ title: 'Type modifié', description: 'Le type d\'activité a été mis à jour.' });
    } else {
      addExtraActivityType(data);
      toast({ title: 'Type créé', description: 'Le nouveau type d\'activité a été créé.' });
    }
  };

  const handleConfirmDeleteType = () => {
    if (deleteTypeId) {
      // Check if any activities use this type
      const hasActivities = extraActivities.some((a) => a.activityTypeId === deleteTypeId);
      if (hasActivities) {
        toast({
          title: 'Impossible de supprimer',
          description: 'Ce type est utilisé par des activités existantes.',
          variant: 'destructive',
        });
      } else {
        deleteExtraActivityType(deleteTypeId);
        toast({ title: 'Type supprimé', description: 'Le type d\'activité a été supprimé.' });
      }
      setDeleteTypeId(null);
    }
  };

  // Activity handlers
  const handleAddActivity = () => {
    setEditingActivity(null);
    setIsActivityDialogOpen(true);
  };

  const handleEditActivity = (activity: ExtraActivity) => {
    setEditingActivity(activity);
    setIsActivityDialogOpen(true);
  };

  const handleActivitySubmit = (data: Omit<ExtraActivity, 'id' | 'createdAt'>) => {
    if (editingActivity) {
      updateExtraActivity(editingActivity.id, data);
      toast({ title: 'Activité modifiée', description: 'L\'activité a été mise à jour.' });
    } else {
      addExtraActivity(data);
      toast({ title: 'Activité créée', description: 'La nouvelle activité a été enregistrée.' });
    }
  };

  const handleConfirmDeleteActivity = () => {
    if (deleteActivityId) {
      deleteExtraActivity(deleteActivityId);
      toast({ title: 'Activité supprimée', description: 'L\'activité a été supprimée.' });
      setDeleteActivityId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activités Extra</h1>
            <p className="text-sm text-muted-foreground">Gérez les activités non liées aux lectures</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddType}>
              <Tag className="mr-2 h-4 w-4" />
              Nouveau type
            </Button>
            <Button onClick={handleAddActivity}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle activité
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total activités</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActivities}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ce mois</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisMonthActivities}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Types disponibles</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{extraActivityTypes.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Types management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Types d'activités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {extraActivityTypes.map((type) => (
                <Badge
                  key={type.id}
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-secondary"
                  onClick={() => handleEditType(type)}
                >
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: type.color }} />
                  {type.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTypeId(type.id);
                    }}
                    className="ml-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {extraActivityTypes.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun type d'activité. Créez-en un pour commencer.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une activité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {extraActivityTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: type.color }} />
                    {type.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activities list */}
        <div className="grid gap-4">
          {filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Aucune activité trouvée</p>
                <Button variant="outline" className="mt-4" onClick={handleAddActivity}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une activité
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredActivities.map((activity) => {
              const type = getExtraActivityTypeById(activity.activityTypeId);
              return (
                <Card key={activity.id}>
                  <CardContent className="flex items-start justify-between p-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge style={{ backgroundColor: type?.color, color: 'white' }}>
                          {type?.name || 'Type inconnu'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(activity.date), 'PPP', { locale: fr })}
                        </span>
                      </div>
                      {activity.memo && (
                        <p className="text-sm text-foreground">{activity.memo}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteActivityId(activity.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ActivityTypeFormDialog
        open={isTypeDialogOpen}
        onOpenChange={setIsTypeDialogOpen}
        activityType={editingType}
        onSubmit={handleTypeSubmit}
      />

      <ExtraActivityFormDialog
        open={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
        activity={editingActivity}
        activityTypes={extraActivityTypes}
        onSubmit={handleActivitySubmit}
      />

      <DeleteActivityDialog
        open={!!deleteTypeId}
        onOpenChange={(open) => !open && setDeleteTypeId(null)}
        onConfirm={handleConfirmDeleteType}
        title="Supprimer le type"
        description="Êtes-vous sûr de vouloir supprimer ce type d'activité ?"
      />

      <DeleteActivityDialog
        open={!!deleteActivityId}
        onOpenChange={(open) => !open && setDeleteActivityId(null)}
        onConfirm={handleConfirmDeleteActivity}
      />
    </AdminLayout>
  );
}
