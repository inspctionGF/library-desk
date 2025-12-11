import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OtherReader, ReaderType } from '@/hooks/useLibraryStore';

const formSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(50),
  lastName: z.string().min(1, 'Le nom est requis').max(50),
  readerType: z.enum(['parent', 'instructor', 'staff', 'other']),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface OtherReaderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readerToEdit: OtherReader | null;
  nextReaderNumber: string;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    readerType: ReaderType;
    phone?: string;
    email?: string;
    notes?: string;
  }) => void;
}

export function OtherReaderFormDialog({ 
  open, 
  onOpenChange, 
  readerToEdit, 
  nextReaderNumber,
  onSubmit 
}: OtherReaderFormDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      readerType: 'parent',
      phone: '',
      email: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (readerToEdit) {
      form.reset({
        firstName: readerToEdit.firstName,
        lastName: readerToEdit.lastName,
        readerType: readerToEdit.readerType,
        phone: readerToEdit.phone || '',
        email: readerToEdit.email || '',
        notes: readerToEdit.notes || '',
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        readerType: 'parent',
        phone: '',
        email: '',
        notes: '',
      });
    }
  }, [readerToEdit, form, open]);

  const handleSubmit = (data: FormData) => {
    onSubmit({
      firstName: data.firstName,
      lastName: data.lastName,
      readerType: data.readerType,
      phone: data.phone || undefined,
      email: data.email || undefined,
      notes: data.notes || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {readerToEdit ? 'Modifier le lecteur' : 'Nouveau lecteur'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Reader Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de lecteur</label>
              <Input 
                value={readerToEdit?.readerNumber || nextReaderNumber} 
                disabled 
                className="font-mono bg-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="readerType"
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
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="instructor">Instructeur</SelectItem>
                      <SelectItem value="staff">Personnel</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <FormLabel>Téléphone (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="+33 6 00 00 00 00" {...field} />
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
                    <FormLabel>Email (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {readerToEdit ? 'Enregistrer' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
