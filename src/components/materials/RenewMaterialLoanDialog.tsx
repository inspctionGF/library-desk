import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLibraryStore, MaterialLoan } from '@/hooks/useLibraryStore';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

interface RenewMaterialLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: MaterialLoan | null;
}

const RenewMaterialLoanDialog = ({ open, onOpenChange, loan }: RenewMaterialLoanDialogProps) => {
  const { renewMaterialLoan, getMaterialById } = useLibraryStore();
  const [newDueDate, setNewDueDate] = useState('');

  const material = loan ? getMaterialById(loan.materialId) : null;

  useEffect(() => {
    if (loan) {
      setNewDueDate(format(addDays(new Date(loan.dueDate), 14), 'yyyy-MM-dd'));
    }
  }, [loan]);

  const handleRenew = () => {
    if (loan && newDueDate) {
      renewMaterialLoan(loan.id, newDueDate);
      toast.success('Prêt renouvelé');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Renouveler le prêt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Matériel:</strong> {material?.name}</p>
            <p><strong>Emprunteur:</strong> {loan?.borrowerName}</p>
            <p><strong>Date actuelle:</strong> {loan?.dueDate ? new Date(loan.dueDate).toLocaleDateString('fr-FR') : '-'}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newDueDate">Nouvelle date de retour</Label>
            <Input
              id="newDueDate"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleRenew} disabled={!newDueDate}>
            Renouveler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenewMaterialLoanDialog;
