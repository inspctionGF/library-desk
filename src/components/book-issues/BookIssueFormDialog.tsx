import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLibraryStore, BookIssue, BookIssueType } from '@/hooks/useLibraryStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const issueSchema = z.object({
  bookId: z.string().min(1, 'Veuillez sélectionner un livre'),
  issueType: z.enum(['not_returned', 'damaged', 'torn', 'lost', 'other'] as const),
  quantity: z.number().min(1, 'Minimum 1 exemplaire'),
  borrowerName: z.string().optional(),
  borrowerContact: z.string().optional(),
  notes: z.string().optional(),
});

type IssueFormData = z.infer<typeof issueSchema>;

interface PrefilledData {
  bookId?: string;
  issueType?: BookIssueType;
  borrowerName?: string;
  loanId?: string;
  notes?: string;
  quantityAffected?: number;
}

interface BookIssueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue?: BookIssue | null;
  prefilledData?: PrefilledData;
}

const issueTypeLabels: Record<BookIssueType, string> = {
  not_returned: 'Non retourné',
  damaged: 'Endommagé',
  torn: 'Déchiré',
  lost: 'Perdu',
  other: 'Autre',
};

export function BookIssueFormDialog({ open, onOpenChange, issue, prefilledData }: BookIssueFormDialogProps) {
  const { books, addBookIssue, updateBookIssue } = useLibraryStore();
  const isEditing = !!issue;

  const form = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      bookId: '',
      issueType: 'not_returned',
      quantity: 1,
      borrowerName: '',
      borrowerContact: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (issue) {
      form.reset({
        bookId: issue.bookId,
        issueType: issue.issueType,
        quantity: issue.quantity,
        borrowerName: issue.borrowerName || '',
        borrowerContact: issue.borrowerContact || '',
        notes: issue.notes || '',
      });
    } else if (prefilledData) {
      form.reset({
        bookId: prefilledData.bookId || '',
        issueType: prefilledData.issueType || 'not_returned',
        quantity: prefilledData.quantityAffected || 1,
        borrowerName: prefilledData.borrowerName || '',
        borrowerContact: '',
        notes: prefilledData.notes || '',
      });
    } else {
      form.reset({
        bookId: '',
        issueType: 'not_returned',
        quantity: 1,
        borrowerName: '',
        borrowerContact: '',
        notes: '',
      });
    }
  }, [issue, prefilledData, form, open]);

  const onSubmit = (data: IssueFormData) => {
    if (isEditing && issue) {
      updateBookIssue(issue.id, {
        bookId: data.bookId,
        issueType: data.issueType,
        quantity: data.quantity,
        borrowerName: data.borrowerName || undefined,
        borrowerContact: data.borrowerContact || undefined,
        notes: data.notes || undefined,
      });
      toast.success('Signalement mis à jour');
    } else {
      addBookIssue({
        bookId: data.bookId,
        issueType: data.issueType,
        quantity: data.quantity,
        borrowerName: data.borrowerName || undefined,
        borrowerContact: data.borrowerContact || undefined,
        notes: data.notes || undefined,
        reportDate: new Date().toISOString().split('T')[0],
        status: 'open',
      });
      toast.success('Signalement créé');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le signalement' : 'Signaler un problème'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bookId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Livre *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un livre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title} ({book.quantity} ex.)
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
              name="issueType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de problème *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(issueTypeLabels) as BookIssueType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {issueTypeLabels[type]}
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
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité affectée *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="borrowerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'emprunteur</FormLabel>
                  <FormControl>
                    <Input placeholder="Dernier emprunteur connu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="borrowerContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="Téléphone ou email" {...field} />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Détails supplémentaires sur le problème..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {isEditing ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
