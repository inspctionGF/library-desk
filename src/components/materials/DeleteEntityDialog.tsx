import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLibraryStore, Entity } from '@/hooks/useLibraryStore';
import { toast } from 'sonner';

interface DeleteEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: Entity | null;
}

const DeleteEntityDialog = ({ open, onOpenChange, entity }: DeleteEntityDialogProps) => {
  const { deleteEntity, materialLoans } = useLibraryStore();

  const handleDelete = () => {
    if (entity) {
      const activeLoans = materialLoans.filter(l => l.borrowerId === entity.id && l.borrowerType === 'entity' && l.status !== 'returned').length;
      if (activeLoans > 0) {
        toast.error(`Cette entité a ${activeLoans} prêt(s) actif(s)`);
        return;
      }
      deleteEntity(entity.id);
      toast.success('Entité supprimée');
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'entité ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer "{entity?.name}" ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEntityDialog;
