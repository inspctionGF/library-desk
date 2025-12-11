import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { OtherReader } from '@/hooks/useLibraryStore';

interface DeleteOtherReaderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reader: OtherReader | null;
  onConfirm: () => void;
}

export function DeleteOtherReaderDialog({ open, onOpenChange, reader, onConfirm }: DeleteOtherReaderDialogProps) {
  if (!reader) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le lecteur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer "{reader.firstName} {reader.lastName}" ({reader.readerNumber}) ?
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
