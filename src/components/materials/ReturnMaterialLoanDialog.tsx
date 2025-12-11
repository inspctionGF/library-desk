import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLibraryStore, MaterialLoan } from '@/hooks/useLibraryStore';
import { toast } from 'sonner';

interface ReturnMaterialLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: MaterialLoan | null;
}

const ReturnMaterialLoanDialog = ({ open, onOpenChange, loan }: ReturnMaterialLoanDialogProps) => {
  const { returnMaterialLoan, getMaterialById } = useLibraryStore();

  const material = loan ? getMaterialById(loan.materialId) : null;

  const handleReturn = () => {
    if (loan) {
      returnMaterialLoan(loan.id);
      toast.success('Matériel retourné');
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer le retour</AlertDialogTitle>
          <AlertDialogDescription>
            Confirmez-vous le retour de "{material?.name}" ({loan?.quantity} unité{(loan?.quantity || 0) > 1 ? 's' : ''}) par {loan?.borrowerName} ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleReturn}>
            Confirmer le retour
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReturnMaterialLoanDialog;
