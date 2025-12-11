import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLibraryStore, BookIssue } from '@/hooks/useLibraryStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const resolveSchema = z.object({
  status: z.enum(['resolved', 'written_off'] as const),
  resolution: z.string().min(1, 'Veuillez décrire la résolution'),
  adjustQuantity: z.boolean().default(false),
});

type ResolveFormData = z.infer<typeof resolveSchema>;

interface ResolveIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: BookIssue | null;
}

export function ResolveIssueDialog({ open, onOpenChange, issue }: ResolveIssueDialogProps) {
  const { resolveBookIssue, getBookById, updateBook } = useLibraryStore();

  const form = useForm<ResolveFormData>({
    resolver: zodResolver(resolveSchema),
    defaultValues: {
      status: 'resolved',
      resolution: '',
      adjustQuantity: false,
    },
  });

  const book = issue ? getBookById(issue.bookId) : null;

  const onSubmit = (data: ResolveFormData) => {
    if (!issue) return;

    resolveBookIssue(issue.id, data.status, data.resolution);

    // Optionally adjust book quantity for written-off items
    if (data.adjustQuantity && data.status === 'written_off' && book) {
      const newQuantity = Math.max(0, book.quantity - issue.quantity);
      const newAvailable = Math.max(0, book.availableCopies - issue.quantity);
      updateBook(book.id, {
        quantity: newQuantity,
        availableCopies: newAvailable,
      });
      toast.success(`Quantité du livre ajustée: ${book.quantity} → ${newQuantity}`);
    }

    toast.success(data.status === 'resolved' ? 'Problème résolu' : 'Problème radié');
    onOpenChange(false);
    form.reset();
  };

  const watchStatus = form.watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Résoudre le signalement</DialogTitle>
          {book && (
            <DialogDescription>
              {book.title} - {issue?.quantity} exemplaire(s)
            </DialogDescription>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de résolution *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="resolved">
                        Résolu (retourné, remplacé, réparé)
                      </SelectItem>
                      <SelectItem value="written_off">
                        Radié (perte acceptée)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resolution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description de la résolution *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        watchStatus === 'resolved'
                          ? 'Ex: Livre retourné par le participant le 15/12...'
                          : 'Ex: Livre déclaré perdu, non récupérable...'
                      }
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchStatus === 'written_off' && book && (
              <FormField
                control={form.control}
                name="adjustQuantity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Ajuster la quantité du livre
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Réduire de {issue?.quantity} exemplaire(s) ({book.quantity} → {Math.max(0, book.quantity - (issue?.quantity || 0))})
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Confirmer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
