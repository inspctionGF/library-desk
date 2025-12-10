import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SchoolClass } from '@/hooks/useLibraryStore';
import { AgeRange, ageRangeOptions } from '@/lib/ageRanges';

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classToEdit?: SchoolClass | null;
  onSubmit: (data: { name: string; ageRange: AgeRange; monitorName: string }) => void;
}

export function ClassFormDialog({ open, onOpenChange, classToEdit, onSubmit }: ClassFormDialogProps) {
  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState<AgeRange>('6-8');
  const [monitorName, setMonitorName] = useState('');

  useEffect(() => {
    if (classToEdit) {
      setName(classToEdit.name);
      setAgeRange(classToEdit.ageRange);
      setMonitorName(classToEdit.monitorName);
    } else {
      setName('');
      setAgeRange('6-8');
      setMonitorName('');
    }
  }, [classToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), ageRange, monitorName: monitorName.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {classToEdit ? 'Modifier la classe' : 'Nouvelle classe'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la classe *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Classe Étoiles"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ageRange">Tranche d'âge *</Label>
            <Select value={ageRange} onValueChange={(v) => setAgeRange(v as AgeRange)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une tranche" />
              </SelectTrigger>
              <SelectContent>
                {ageRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monitorName">Nom du moniteur</Label>
            <Input
              id="monitorName"
              value={monitorName}
              onChange={(e) => setMonitorName(e.target.value)}
              placeholder="Ex: Mme Dupont"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {classToEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
