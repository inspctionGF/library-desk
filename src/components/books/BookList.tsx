import { Edit, Trash2, BookCopy, MoreHorizontal, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Book, Category } from '@/hooks/useLibraryStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BookListProps {
  books: Book[];
  categories: Category[];
  selectedBooks: string[];
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onLoan: (book: Book) => void;
  onSelectBook: (bookId: string) => void;
  onSelectAll: () => void;
  onExportSheet: (book: Book) => void;
}

export function BookList({ 
  books, 
  categories, 
  selectedBooks,
  onEdit, 
  onDelete, 
  onLoan,
  onSelectBook,
  onSelectAll,
  onExportSheet,
}: BookListProps) {
  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const getStockStatus = (book: Book) => {
    if (book.availableCopies === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (book.availableCopies <= 2) return { label: 'Restock', variant: 'warning' as const };
    return { label: 'In Stock', variant: 'success' as const };
  };

  const allSelected = books.length > 0 && books.every(book => selectedBooks.includes(book.id));
  const someSelected = books.some(book => selectedBooks.includes(book.id)) && !allSelected;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-12">
              <Checkbox 
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
                  }
                }}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="font-medium text-muted-foreground">Book</TableHead>
            <TableHead className="font-medium text-muted-foreground">Author</TableHead>
            <TableHead className="font-medium text-muted-foreground">Category</TableHead>
            <TableHead className="font-medium text-muted-foreground text-center">Stock</TableHead>
            <TableHead className="font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="font-medium text-muted-foreground text-right">+</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => {
            const category = getCategoryById(book.categoryId);
            const stockStatus = getStockStatus(book);

            const isSelected = selectedBooks.includes(book.id);

            return (
              <TableRow 
                key={book.id} 
                className={cn(
                  "hover:bg-muted/20",
                  isSelected && "bg-primary/5"
                )}
              >
                <TableCell>
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => onSelectBook(book.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
                      ) : (
                        <BookCopy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-foreground">{book.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{book.author}</TableCell>
                <TableCell>
                  {category && (
                    <span 
                      className="inline-flex items-center gap-1.5 text-sm"
                      style={{ color: category.color }}
                    >
                      <span 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {book.availableCopies}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium border-0",
                      stockStatus.variant === 'success' && 'bg-success/10 text-success',
                      stockStatus.variant === 'warning' && 'bg-accent/10 text-accent',
                      stockStatus.variant === 'destructive' && 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {stockStatus.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(book)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onLoan(book)}
                        disabled={book.availableCopies === 0}
                      >
                        <BookCopy className="h-4 w-4 mr-2" />
                        Prêter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExportSheet(book)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Fiche technique
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(book)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Pagination footer */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
        <div className="text-muted-foreground">
          Showing per page <span className="font-medium text-foreground">10</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border">
            {'<'}
          </Button>
          <Button variant="default" size="sm" className="h-8 w-8 p-0">
            1
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            2
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            3
          </Button>
          <span className="px-2 text-muted-foreground">...</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {Math.ceil(books.length / 10)}
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border">
            {'>'}
          </Button>
        </div>
      </div>
    </div>
  );
}