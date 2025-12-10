import { Edit, Trash2, BookCopy } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Book, Category } from '@/hooks/useLibraryStore';

interface BookListProps {
  books: Book[];
  categories: Category[];
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onLoan: (book: Book) => void;
}

export function BookList({ books, categories, onEdit, onDelete, onLoan }: BookListProps) {
  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-bold">Title</TableHead>
            <TableHead className="font-bold">Author</TableHead>
            <TableHead className="font-bold">Category</TableHead>
            <TableHead className="font-bold">ISBN</TableHead>
            <TableHead className="font-bold text-center">Available</TableHead>
            <TableHead className="font-bold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => {
            const category = getCategoryById(book.categoryId);
            const isAvailable = book.availableCopies > 0;
            const isLowStock = book.availableCopies > 0 && book.availableCopies <= 2;

            return (
              <TableRow key={book.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell className="text-muted-foreground">{book.author}</TableCell>
                <TableCell>
                  {category && (
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: category.color,
                        color: category.color,
                      }}
                    >
                      {category.name}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {book.isbn || '—'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={cn(
                      'font-bold',
                      !isAvailable && 'bg-destructive text-destructive-foreground',
                      isLowStock && 'bg-accent text-accent-foreground',
                      isAvailable && !isLowStock && 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {book.availableCopies}/{book.quantity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(book)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onLoan(book)}
                      disabled={!isAvailable}
                      className="text-secondary hover:text-secondary"
                    >
                      <BookCopy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onDelete(book)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
