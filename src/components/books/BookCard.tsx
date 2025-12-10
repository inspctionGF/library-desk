import { BookOpen, Edit, Trash2, BookCopy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Book, Category } from '@/hooks/useLibraryStore';

interface BookCardProps {
  book: Book;
  category?: Category;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onLoan: (book: Book) => void;
}

export function BookCard({ book, category, onEdit, onDelete, onLoan }: BookCardProps) {
  const isAvailable = book.availableCopies > 0;
  const isLowStock = book.availableCopies > 0 && book.availableCopies <= 2;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-playful-lg">
      <div className="aspect-[3/4] relative bg-muted flex items-center justify-center overflow-hidden">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-4"
            style={{ backgroundColor: category?.color ? `${category.color}20` : undefined }}
          >
            <BookOpen 
              className="h-16 w-16 mb-3" 
              style={{ color: category?.color || 'hsl(var(--primary))' }}
            />
            <p className="text-xs text-center text-muted-foreground font-medium">
              {category?.name || 'Uncategorized'}
            </p>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge 
            variant="secondary"
            className={cn(
              'text-xs font-bold',
              !isAvailable && 'bg-destructive text-destructive-foreground',
              isLowStock && 'bg-accent text-accent-foreground',
              isAvailable && !isLowStock && 'bg-secondary text-secondary-foreground'
            )}
          >
            {book.availableCopies}/{book.quantity}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="icon" variant="secondary" onClick={() => onEdit(book)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            onClick={() => onLoan(book)}
            disabled={!isAvailable}
          >
            <BookCopy className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="destructive" onClick={() => onDelete(book)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-sm line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
        {category && (
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ 
              borderColor: category.color,
              color: category.color,
            }}
          >
            {category.name}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
