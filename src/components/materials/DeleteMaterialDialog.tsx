import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLibraryStore, Material } from '@/hooks/useLibraryStore';
import { toast } from 'sonner';

interface DeleteMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material | null;
}

const DeleteMaterialDialog = ({ open, onOpenChange, material }: DeleteMaterialDialogProps) => {
  const { deleteMaterial, materialLoans } = useLibraryStore();

  const handleDelete = () => {
    if (material) {
      const activeLoans = materialLoans.filter(l => l.materialId === material.id && l.status !== 'returned').length;
      if (activeLoans > 0) {
        toast.error(`Ce matériel a ${activeLoans} prêt(s) actif(s)`);
        return;
      }
      deleteMaterial(material.id);
      toast.success('Matériel supprimé');
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le matériel ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer "{material?.name}" ? Cette action est irréversible.
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

export default DeleteMaterialDialog;
