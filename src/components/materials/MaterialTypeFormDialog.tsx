import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLibraryStore, MaterialType } from '@/hooks/useLibraryStore';
import { toast } from 'sonner';

const colorOptions = [
  { value: 'hsl(262, 83%, 58%)', label: 'Violet' },
  { value: 'hsl(174, 72%, 40%)', label: 'Sarcelle' },
  { value: 'hsl(25, 95%, 53%)', label: 'Orange' },
  { value: 'hsl(200, 80%, 50%)', label: 'Bleu' },
  { value: 'hsl(340, 75%, 55%)', label: 'Rose' },
  { value: 'hsl(142, 76%, 36%)', label: 'Vert' },
  { value: 'hsl(38, 92%, 50%)', label: 'Jaune' },
];

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50),
  color: z.string().min(1, 'La couleur est requise'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MaterialTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialType?: MaterialType | null;
}

const MaterialTypeFormDialog = ({ open, onOpenChange, materialType }: MaterialTypeFormDialogProps) => {
  const { addMaterialType, updateMaterialType, deleteMaterialType, materials } = useLibraryStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      color: colorOptions[0].value,
      description: '',
    },
  });

  useEffect(() => {
    if (materialType) {
      form.reset({
        name: materialType.name,
        color: materialType.color,
        description: materialType.description || '',
      });
    } else {
      form.reset({
        name: '',
        color: colorOptions[0].value,
        description: '',
      });
    }
  }, [materialType, form]);

  const onSubmit = (data: FormData) => {
    if (materialType) {
      updateMaterialType(materialType.id, data);
      toast.success('Type modifié');
    } else {
      addMaterialType({ name: data.name, color: data.color, description: data.description });
      toast.success('Type ajouté');
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (materialType) {
      const usedCount = materials.filter(m => m.materialTypeId === materialType.id).length;
      if (usedCount > 0) {
        toast.error(`Ce type est utilisé par ${usedCount} matériel(s)`);
        return;
      }
      deleteMaterialType(materialType.id);
      toast.success('Type supprimé');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{materialType ? 'Modifier le type' : 'Nouveau type de matériel'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Équipement audiovisuel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couleur</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${field.value === color.value ? 'border-foreground scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => field.onChange(color.value)}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description du type..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              {materialType && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Supprimer
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button type="submit">{materialType ? 'Enregistrer' : 'Ajouter'}</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialTypeFormDialog;
