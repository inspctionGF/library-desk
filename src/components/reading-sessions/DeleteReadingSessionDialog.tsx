import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ReadingSession, useLibraryStore } from '@/hooks/useLibraryStore';

interface DeleteReadingSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: ReadingSession | null;
  onConfirm: () => void;
}

export function DeleteReadingSessionDialog({ open, onOpenChange, session, onConfirm }: DeleteReadingSessionDialogProps) {
  const { getParticipantById, getBookById } = useLibraryStore();
  
  if (!session) return null;
  
  const participant = getParticipantById(session.participantId);
  const book = getBookById(session.bookId);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la session de lecture ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer cette session de lecture ?
            <br /><br />
            <strong>Participant :</strong> {participant?.firstName} {participant?.lastName}
            <br />
            <strong>Livre :</strong> {book?.title}
            <br /><br />
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
