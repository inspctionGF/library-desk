import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Users, GraduationCap } from 'lucide-react';
import { useAuditedLibraryStore } from '@/hooks/useAuditedLibraryStore';
import { SchoolClass } from '@/hooks/useLibraryStore';
import { ClassFormDialog } from '@/components/classes/ClassFormDialog';
import { DeleteClassDialog } from '@/components/classes/DeleteClassDialog';
import { ageRangeColors, getAgeRangeLabel, AgeRange } from '@/lib/ageRanges';
import { toast } from 'sonner';
import { useInitialLoading } from '@/hooks/useLoadingState';
import { GridPageSkeleton } from '@/components/skeletons';

export default function Classes() {
  const navigate = useNavigate();
  const { classes, participants, addClass, updateClass, deleteClass } = useAuditedLibraryStore();
  const isLoading = useInitialLoading(400);
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);

  const getParticipantCount = (classId: string) => {
    return participants.filter(p => p.classId === classId).length;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <GridPageSkeleton itemsCount={8} columns={4} />
      </AdminLayout>
    );
  }

  const handleAdd = () => {
    setSelectedClass(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (cls: SchoolClass, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClass(cls);
    setFormDialogOpen(true);
  };

  const handleDelete = (cls: SchoolClass, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClass(cls);
    setDeleteDialogOpen(true);
  };

  const handleCardClick = (classId: string) => {
    navigate(`/participants?class=${classId}`);
  };

  const handleFormSubmit = (data: { name: string; ageRange: AgeRange; monitorName: string }) => {
    if (selectedClass) {
      updateClass(selectedClass.id, data);
      toast.success('Classe modifiée avec succès');
    } else {
      addClass(data);
      toast.success('Classe créée avec succès');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedClass) {
      deleteClass(selectedClass.id);
      toast.success('Classe supprimée avec succès');
      setDeleteDialogOpen(false);
      setSelectedClass(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
            <p className="text-muted-foreground">
              {classes.length} classe{classes.length > 1 ? 's' : ''} • Cliquez sur une classe pour voir ses participants
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle classe
          </Button>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <Card className="p-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucune classe</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer une classe pour organiser vos participants.
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une classe
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classes.map((cls) => {
              const participantCount = getParticipantCount(cls.id);
              const ageRangeColor = ageRangeColors[cls.ageRange];
              
              return (
                <Card 
                  key={cls.id}
                  className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
                  onClick={() => handleCardClick(cls.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${ageRangeColor}20` }}
                      >
                        <GraduationCap 
                          className="h-5 w-5" 
                          style={{ color: ageRangeColor }}
                        />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => handleEdit(cls, e)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => handleDelete(cls, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: ageRangeColor,
                        color: ageRangeColor
                      }}
                    >
                      {getAgeRangeLabel(cls.ageRange)}
                    </Badge>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{participantCount} participant{participantCount > 1 ? 's' : ''}</span>
                    </div>
                    
                    {cls.monitorName && (
                      <p className="text-sm text-muted-foreground">
                        Moniteur: {cls.monitorName}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <ClassFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        classToEdit={selectedClass}
        onSubmit={handleFormSubmit}
      />

      <DeleteClassDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        classToDelete={selectedClass}
        participantCount={selectedClass ? getParticipantCount(selectedClass.id) : 0}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}
