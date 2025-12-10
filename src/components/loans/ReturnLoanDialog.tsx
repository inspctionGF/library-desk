import { useLibraryStore } from '@/hooks/useLibraryStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReturnLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string | null;
}

export function ReturnLoanDialog({ open, onOpenChange, loanId }: ReturnLoanDialogProps) {
  const { returnLoan, getLoanById, getBookById, getParticipantById } = useLibraryStore();

  const loan = loanId ? getLoanById(loanId) : null;
  const book = loan ? getBookById(loan.bookId) : null;
  const participant = loan ? getParticipantById(loan.participantId) : null;

  const handleConfirm = () => {
    if (loanId) {
      returnLoan(loanId);
      toast.success('Livre récupéré avec succès');
      onOpenChange(false);
    }
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer le retour</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir enregistrer le retour de ce livre ?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2">
          <p><strong>Livre:</strong> {book?.title || 'Inconnu'}</p>
          <p><strong>Participant:</strong> {participant ? `${participant.firstName} ${participant.lastName}` : loan.participantName}</p>
          <p><strong>Date d'emprunt:</strong> {new Date(loan.loanDate).toLocaleDateString('fr-FR')}</p>
          <p><strong>Date de retour prévue:</strong> {new Date(loan.dueDate).toLocaleDateString('fr-FR')}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleConfirm}>Confirmer le retour</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
