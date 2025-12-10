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
import { SchoolClass } from '@/hooks/useLibraryStore';

interface DeleteClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classToDelete: SchoolClass | null;
  participantCount: number;
  onConfirm: () => void;
}

export function DeleteClassDialog({ 
  open, 
  onOpenChange, 
  classToDelete, 
  participantCount,
  onConfirm 
}: DeleteClassDialogProps) {
  const hasParticipants = participantCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasParticipants ? 'Impossible de supprimer' : 'Supprimer la classe'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasParticipants ? (
              <>
                La classe <strong>{classToDelete?.name}</strong> contient{' '}
                <strong>{participantCount} participant(s)</strong>. 
                Veuillez d'abord retirer ou supprimer ces participants avant de supprimer la classe.
              </>
            ) : (
              <>
                Êtes-vous sûr de vouloir supprimer la classe{' '}
                <strong>{classToDelete?.name}</strong> ? Cette action est irréversible.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          {!hasParticipants && (
            <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
