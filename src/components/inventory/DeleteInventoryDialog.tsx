import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLibraryStore } from '@/hooks/useLibraryStore';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DeleteInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}

export function DeleteInventoryDialog({ open, onOpenChange, sessionId }: DeleteInventoryDialogProps) {
  const { deleteInventorySession, inventorySessions } = useLibraryStore();
  const session = inventorySessions.find(s => s.id === sessionId);

  const handleDelete = () => {
    deleteInventorySession(sessionId);
    toast.success('Inventaire supprimé');
    onOpenChange(false);
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Supprimer l'inventaire
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer l'inventaire "{session.name}" ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}