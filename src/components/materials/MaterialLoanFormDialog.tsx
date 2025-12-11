import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLibraryStore } from '@/hooks/useLibraryStore';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

const formSchema = z.object({
  materialId: z.string().min(1, 'Le matériel est requis'),
  borrowerType: z.enum(['participant', 'entity']),
  borrowerId: z.string().min(1, 'L\'emprunteur est requis'),
  quantity: z.coerce.number().min(1, 'La quantité doit être au moins 1'),
  dueDate: z.string().min(1, 'La date de retour est requise'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MaterialLoanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MaterialLoanFormDialog = ({ open, onOpenChange }: MaterialLoanFormDialogProps) => {
  const { materials, participants, entities, addMaterialLoan, getMaterialById } = useLibraryStore();
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  const availableMaterials = materials.filter(m => m.availableQuantity > 0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materialId: '',
      borrowerType: 'participant',
      borrowerId: '',
      quantity: 1,
      dueDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
      notes: '',
    },
  });

  const borrowerType = form.watch('borrowerType');
  const materialId = form.watch('materialId');
  const quantity = form.watch('quantity');

  useEffect(() => {
    if (materialId) {
      const material = getMaterialById(materialId);
      setSelectedMaterial(material);
    } else {
      setSelectedMaterial(null);
    }
  }, [materialId, getMaterialById]);

  useEffect(() => {
    form.setValue('borrowerId', '');
  }, [borrowerType, form]);

  useEffect(() => {
    if (!open) {
      form.reset({
        materialId: '',
        borrowerType: 'participant',
        borrowerId: '',
        quantity: 1,
        dueDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
        notes: '',
      });
      setSelectedMaterial(null);
    }
  }, [open, form]);

  const onSubmit = (data: FormData) => {
    const material = getMaterialById(data.materialId);
    if (!material || material.availableQuantity < data.quantity) {
      toast.error('Quantité insuffisante');
      return;
    }

    addMaterialLoan({
      materialId: data.materialId,
      borrowerType: data.borrowerType,
      borrowerId: data.borrowerId,
      quantity: data.quantity,
      dueDate: data.dueDate,
      notes: data.notes,
    });
    toast.success('Prêt créé');
    onOpenChange(false);
  };

  const borrowers = borrowerType === 'participant' ? participants : entities;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau prêt de matériel</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="materialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matériel</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un matériel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableMaterials.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} ({m.availableQuantity} disponible{m.availableQuantity > 1 ? 's' : ''})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="borrowerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'emprunteur</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="participant">Participant</SelectItem>
                      <SelectItem value="entity">Entité</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="borrowerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{borrowerType === 'participant' ? 'Participant' : 'Entité'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Sélectionner ${borrowerType === 'participant' ? 'un participant' : 'une entité'}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {borrowerType === 'participant' ? (
                        participants.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName}
                          </SelectItem>
                        ))
                      ) : (
                        entities.map(e => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
                      <Input 
                        type="number" 
                        min={1} 
                        max={selectedMaterial?.availableQuantity || 1}
                        {...field} 
                      />
                    </FormControl>
                    {selectedMaterial && quantity > selectedMaterial.availableQuantity && (
                      <p className="text-xs text-destructive">Max: {selectedMaterial.availableQuantity}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de retour</FormLabel>
                    <FormControl>
                      <Input type="date" min={format(new Date(), 'yyyy-MM-dd')} {...field} />
                    </FormControl>
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
              <Button type="submit">Créer le prêt</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialLoanFormDialog;
