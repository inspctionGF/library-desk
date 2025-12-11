import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLibraryStore, InventorySession } from '@/hooks/useLibraryStore';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, Package } from 'lucide-react';

interface CompleteInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: InventorySession;
}

export function CompleteInventoryDialog({ open, onOpenChange, session }: CompleteInventoryDialogProps) {
  const { completeInventorySession, getInventoryStats, getInventoryItems, getBookById } = useLibraryStore();
  const stats = getInventoryStats(session.id);
  const items = getInventoryItems(session.id);
  const discrepancyItems = items.filter(i => i.status === 'discrepancy');

  const handleComplete = () => {
    completeInventorySession(session.id);
    toast.success('Inventaire terminé avec succès');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finaliser l'inventaire</DialogTitle>
          <DialogDescription>
            Confirmez la fin de l'inventaire "{session.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted">
              <Package className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Livres vérifiés</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-green-500">{stats.checked}</p>
              <p className="text-xs text-muted-foreground">Conformes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-500/10">
              <AlertTriangle className="h-6 w-6 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-orange-500">{stats.discrepancy}</p>
              <p className="text-xs text-muted-foreground">Écarts</p>
            </div>
          </div>

          {/* Discrepancy Details */}
          {discrepancyItems.length > 0 && (
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Livres avec écarts ({discrepancyItems.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {discrepancyItems.map(item => {
                  const book = getBookById(item.bookId);
                  if (!book) return null;
                  const diff = (item.foundQuantity || 0) - item.expectedQuantity;
                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{book.title}</span>
                      <span className={diff < 0 ? 'text-destructive' : 'text-orange-500'}>
                        {diff > 0 ? '+' : ''}{diff}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Missing Books Warning */}
          {stats.missingBooks > 0 && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm">
              <p className="text-destructive font-medium">
                Attention: {stats.missingBooks} livre(s) manquant(s) détecté(s)
              </p>
              <p className="text-destructive/80 mt-1">
                Vérifiez les prêts en cours et les emplacements de rangement.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleComplete}>
            Finaliser l'inventaire
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}