import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLibraryStore, Material } from '@/hooks/useLibraryStore';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  materialTypeId: z.string().min(1, 'Le type est requis'),
  serialNumber: z.string().optional(),
  quantity: z.coerce.number().min(1, 'La quantité doit être au moins 1'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material | null;
}

const MaterialFormDialog = ({ open, onOpenChange, material }: MaterialFormDialogProps) => {
  const { materialTypes, addMaterial, updateMaterial } = useLibraryStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      materialTypeId: '',
      serialNumber: '',
      quantity: 1,
      condition: 'good',
      notes: '',
    },
  });

  useEffect(() => {
    if (material) {
      form.reset({
        name: material.name,
        materialTypeId: material.materialTypeId,
        serialNumber: material.serialNumber || '',
        quantity: material.quantity,
        condition: material.condition,
        notes: material.notes || '',
      });
    } else {
      form.reset({
        name: '',
        materialTypeId: materialTypes[0]?.id || '',
        serialNumber: '',
        quantity: 1,
        condition: 'good',
        notes: '',
      });
    }
  }, [material, materialTypes, form]);

  const onSubmit = (data: FormData) => {
    if (material) {
      const quantityDiff = data.quantity - material.quantity;
      updateMaterial(material.id, {
        ...data,
        availableQuantity: material.availableQuantity + quantityDiff,
      });
      toast.success('Matériel modifié');
    } else {
      addMaterial({
        name: data.name,
        materialTypeId: data.materialTypeId,
        serialNumber: data.serialNumber,
        quantity: data.quantity,
        condition: data.condition,
        notes: data.notes,
      });
      toast.success('Matériel ajouté');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{material ? 'Modifier le matériel' : 'Nouveau matériel'}</DialogTitle>
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
                    <Input placeholder="Ex: Télévision Samsung 42'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="materialTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materialTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de série (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: SN-123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>État</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Bon</SelectItem>
                        <SelectItem value="fair">Correct</SelectItem>
                        <SelectItem value="poor">Mauvais</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes additionnelles..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">{material ? 'Enregistrer' : 'Ajouter'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialFormDialog;
