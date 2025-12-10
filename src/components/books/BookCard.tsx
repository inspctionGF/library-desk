import { Edit, Trash2, BookCopy, MoreVertical, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Book, Category } from '@/hooks/useLibraryStore';

interface BookCardProps {
  book: Book;
  category?: Category;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onLoan: (book: Book) => void;
  onExportSheet: (book: Book) => void;
}

export function BookCard({ book, category, onEdit, onDelete, onLoan, onExportSheet }: BookCardProps) {
  const isAvailable = book.availableCopies > 0;

  const getStockStatus = () => {
    if (book.availableCopies === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (book.availableCopies <= 2) return { label: 'Low Stock', variant: 'warning' as const };
    return { label: 'In Stock', variant: 'success' as const };
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="group overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[3/4] relative bg-muted overflow-hidden">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <BookCopy className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(book)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onLoan(book)} disabled={!isAvailable}>
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
        </div>
      </div>
      <CardContent className="p-4 space-y-2">
        <div>
          <h3 className="font-medium text-foreground line-clamp-1">{book.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
        </div>
        <div className="flex items-center justify-between">
          {category && (
            <span 
              className="inline-flex items-center gap-1.5 text-xs"
              style={{ color: category.color }}
            >
              <span 
                className="h-1.5 w-1.5 rounded-full" 
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </span>
          )}
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium border-0",
              stockStatus.variant === 'success' && 'bg-success/10 text-success',
              stockStatus.variant === 'warning' && 'bg-accent/10 text-accent',
              stockStatus.variant === 'destructive' && 'bg-destructive/10 text-destructive'
            )}
          >
            {book.availableCopies}/{book.quantity}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}