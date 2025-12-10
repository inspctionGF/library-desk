import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { useLibraryStore } from '@/hooks/useLibraryStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LoanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanFormDialog({ open, onOpenChange }: LoanFormDialogProps) {
  const { participants, books, addLoan, getActiveLoansForParticipant, canParticipantBorrow } = useLibraryStore();
  
  const [participantId, setParticipantId] = useState('');
  const [bookId, setBookId] = useState('');
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 14));

  const selectedParticipant = participants.find(p => p.id === participantId);
  const activeLoansCount = participantId ? getActiveLoansForParticipant(participantId).length : 0;
  const canBorrow = participantId ? canParticipantBorrow(participantId) : true;

  // Filter available books
  const availableBooks = books.filter(b => b.availableCopies > 0);

  const handleSubmit = () => {
    if (!participantId || !bookId || !dueDate) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (!canBorrow) {
      toast.error('Ce participant a déjà 3 prêts actifs');
      return;
    }

    const participant = participants.find(p => p.id === participantId);
    
    addLoan({
      bookId,
      participantId,
      participantName: participant ? `${participant.firstName} ${participant.lastName}` : '',
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      returnDate: null,
    });

    toast.success('Prêt enregistré avec succès');
    handleClose();
  };

  const handleClose = () => {
    setParticipantId('');
    setBookId('');
    setDueDate(addDays(new Date(), 14));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau prêt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Participant Selection */}
          <div className="space-y-2">
            <Label>Participant</Label>
            <Select value={participantId} onValueChange={setParticipantId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un participant" />
              </SelectTrigger>
              <SelectContent>
                {participants.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.participantNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {participantId && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Prêts actifs:</span>
                <Badge 
                  variant={activeLoansCount >= 3 ? "destructive" : activeLoansCount >= 2 ? "secondary" : "outline"}
                >
                  {activeLoansCount}/3
                </Badge>
              </div>
            )}
          </div>

          {/* Book Selection */}
          <div className="space-y-2">
            <Label>Livre</Label>
            <Select value={bookId} onValueChange={setBookId} disabled={!canBorrow}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un livre disponible" />
              </SelectTrigger>
              <SelectContent>
                {availableBooks.length === 0 ? (
                  <SelectItem value="" disabled>Aucun livre disponible</SelectItem>
                ) : (
                  availableBooks.map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.title} - {b.author} ({b.availableCopies} dispo.)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Date de retour prévue</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                  disabled={!canBorrow}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: fr }) : "Choisir une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => date && setDueDate(date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Warning if max loans reached */}
          {!canBorrow && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ce participant a atteint le maximum de 3 prêts actifs. 
                Il doit retourner un livre avant d'en emprunter un nouveau.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!canBorrow || !participantId || !bookId}>
            Enregistrer le prêt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
