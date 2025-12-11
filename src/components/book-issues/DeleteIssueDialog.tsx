import { useLibraryStore, BookIssue } from '@/hooks/useLibraryStore';
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
import { toast } from 'sonner';

interface DeleteIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: BookIssue | null;
}

export function DeleteIssueDialog({ open, onOpenChange, issue }: DeleteIssueDialogProps) {
  const { deleteBookIssue, getBookById } = useLibraryStore();

  const book = issue ? getBookById(issue.bookId) : null;

  const handleDelete = () => {
    if (issue) {
      deleteBookIssue(issue.id);
      toast.success('Signalement supprimé');
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce signalement ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le signalement pour "{book?.title}"?
            Cette action est irréversible.
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
}
