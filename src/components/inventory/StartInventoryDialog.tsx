import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLibraryStore, InventoryType } from '@/hooks/useLibraryStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StartInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartInventoryDialog({ open, onOpenChange }: StartInventoryDialogProps) {
  const { createInventorySession, books } = useLibraryStore();
  const [name, setName] = useState(`Inventaire ${format(new Date(), 'MMMM yyyy', { locale: fr })}`);
  const [type, setType] = useState<InventoryType>('annual');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Veuillez entrer un nom pour l\'inventaire');
      return;
    }

    try {
      createInventorySession(name, type, notes || undefined);
      toast.success('Inventaire démarré');
      onOpenChange(false);
      setName(`Inventaire ${format(new Date(), 'MMMM yyyy', { locale: fr })}`);
      setType('annual');
      setNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du démarrage de l\'inventaire');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Démarrer un inventaire</DialogTitle>
          <DialogDescription>
            Créez un nouvel inventaire pour vérifier physiquement vos livres
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'inventaire</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Inventaire Annuel 2024"
            />
          </div>

          <div className="space-y-2">
            <Label>Type d'inventaire</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as InventoryType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="annual" id="annual" />
                <Label htmlFor="annual" className="font-normal cursor-pointer">
                  Annuel - Inventaire complet de fin d'année
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="adhoc" id="adhoc" />
                <Label htmlFor="adhoc" className="font-normal cursor-pointer">
                  Ponctuel - Vérification partielle ou urgente
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Raison de l'inventaire, remarques..."
              rows={3}
            />
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>{books.length} livres</strong> seront inclus dans cet inventaire.
              Vous pourrez vérifier chaque livre et indiquer la quantité trouvée.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Démarrer l'inventaire
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}