import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ExtraActivityType } from '@/hooks/useLibraryStore';

const colorOptions = [
  { name: 'Violet', value: 'hsl(262, 83%, 58%)' },
  { name: 'Teal', value: 'hsl(174, 72%, 40%)' },
  { name: 'Orange', value: 'hsl(25, 95%, 53%)' },
  { name: 'Rose', value: 'hsl(340, 75%, 55%)' },
  { name: 'Bleu', value: 'hsl(200, 80%, 50%)' },
  { name: 'Vert', value: 'hsl(142, 71%, 45%)' },
  { name: 'Jaune', value: 'hsl(45, 93%, 47%)' },
  { name: 'Indigo', value: 'hsl(239, 84%, 67%)' },
];

interface ActivityTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityType?: ExtraActivityType | null;
  onSubmit: (data: Omit<ExtraActivityType, 'id' | 'createdAt'>) => void;
}

export function ActivityTypeFormDialog({ open, onOpenChange, activityType, onSubmit }: ActivityTypeFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);

  useEffect(() => {
    if (activityType) {
      setName(activityType.name);
      setDescription(activityType.description || '');
      setColor(activityType.color);
    } else {
      setName('');
      setDescription('');
      setColor(colorOptions[0].value);
    }
  }, [activityType, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, color });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{activityType ? 'Modifier le type' : 'Nouveau type d\'activité'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du type</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Réunion staff"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du type d'activité..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === opt.value ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: opt.value }}
                  title={opt.name}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{activityType ? 'Modifier' : 'Créer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
