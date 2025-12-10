import { useState } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useLibraryStore } from '@/hooks/useLibraryStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RenewLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string | null;
}

export function RenewLoanDialog({ open, onOpenChange, loanId }: RenewLoanDialogProps) {
  const { renewLoan, getLoanById, getBookById, getParticipantById } = useLibraryStore();

  const loan = loanId ? getLoanById(loanId) : null;
  const book = loan ? getBookById(loan.bookId) : null;
  const participant = loan ? getParticipantById(loan.participantId) : null;

  const [newDueDate, setNewDueDate] = useState<Date | undefined>(
    loan ? addDays(parseISO(loan.dueDate), 14) : addDays(new Date(), 14)
  );

  const handleConfirm = () => {
    if (loanId && newDueDate) {
      renewLoan(loanId, format(newDueDate, 'yyyy-MM-dd'));
      toast.success('Prêt renouvelé avec succès');
      onOpenChange(false);
    }
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renouveler le prêt</DialogTitle>
          <DialogDescription>
            Choisissez une nouvelle date de retour pour ce prêt.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <p><strong>Livre:</strong> {book?.title || 'Inconnu'}</p>
            <p><strong>Participant:</strong> {participant ? `${participant.firstName} ${participant.lastName}` : loan.participantName}</p>
            <p><strong>Date d'emprunt:</strong> {new Date(loan.loanDate).toLocaleDateString('fr-FR')}</p>
            <p><strong>Ancienne échéance:</strong> {new Date(loan.dueDate).toLocaleDateString('fr-FR')}</p>
          </div>

          <div className="space-y-2">
            <Label>Nouvelle date de retour</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newDueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newDueDate ? format(newDueDate, "PPP", { locale: fr }) : "Choisir une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newDueDate}
                  onSelect={setNewDueDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleConfirm} disabled={!newDueDate}>Renouveler</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
