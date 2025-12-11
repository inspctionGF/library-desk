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
import { useLibraryStore, Entity } from '@/hooks/useLibraryStore';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  type: z.enum(['church', 'school', 'association', 'other']),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity?: Entity | null;
}

const EntityFormDialog = ({ open, onOpenChange, entity }: EntityFormDialogProps) => {
  const { addEntity, updateEntity } = useLibraryStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'church',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (entity) {
      form.reset({
        name: entity.name,
        type: entity.type as any,
        contactName: entity.contactName || '',
        phone: entity.phone || '',
        email: entity.email || '',
        address: entity.address || '',
        notes: entity.notes || '',
      });
    } else {
      form.reset({
        name: '',
        type: 'church',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      });
    }
  }, [entity, form]);

  const onSubmit = (data: FormData) => {
    if (entity) {
      updateEntity(entity.id, data);
      toast.success('Entité modifiée');
    } else {
      addEntity({ name: data.name, type: data.type, contactName: data.contactName, phone: data.phone, email: data.email, address: data.address, notes: data.notes });
      toast.success('Entité ajoutée');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{entity ? 'Modifier l\'entité' : 'Nouvelle entité'}</DialogTitle>
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
                    <Input placeholder="Ex: Église du Quartier Nord" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="church">Église</SelectItem>
                      <SelectItem value="school">École</SelectItem>
                      <SelectItem value="association">Association</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du contact (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Jean Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: +33 1 23 45 67 89" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: contact@eglise.fr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 123 Rue de l'Église, 75001 Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              <Button type="submit">{entity ? 'Enregistrer' : 'Ajouter'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EntityFormDialog;
