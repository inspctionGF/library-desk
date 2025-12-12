import { useState, useMemo } from 'react';
import { Search, Plus, Book, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book as BookType, Category } from '@/hooks/useLibraryStore';
import { cn } from '@/lib/utils';

interface BookSearchGridProps {
  books: BookType[];
  categories: Category[];
  selectedBooks: string[];
  onSelectBook: (bookId: string) => void;
  onRemoveBook: (bookId: string) => void;
}

export function BookSearchGrid({ 
  books, 
  categories, 
  selectedBooks, 
  onSelectBook,
  onRemoveBook 
}: BookSearchGridProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = search === '' || 
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.isbn.includes(search);
      
      const matchesCategory = !selectedCategory || book.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [books, search, selectedCategory]);

  const isBookSelected = (bookId: string) => selectedBooks.includes(bookId);

  const handleBookClick = (book: BookType) => {
    if (book.availableCopies === 0) return;
    
    if (isBookSelected(book.id)) {
      onRemoveBook(book.id);
    } else {
      onSelectBook(book.id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="space-y-3 pb-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, auteur ou ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Category Chips */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="h-7 text-xs"
          >
            Tous
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              size="sm"
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="h-7 text-xs"
              style={selectedCategory === category.id ? { backgroundColor: category.color } : {}}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <ScrollArea className="flex-1 pt-4">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Book className="h-12 w-12 mb-4 opacity-50" />
            <p>Aucun livre trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredBooks.map(book => {
              const category = getCategoryById(book.categoryId);
              const isSelected = isBookSelected(book.id);
              const isAvailable = book.availableCopies > 0;
              
              return (
                <button
                  key={book.id}
                  onClick={() => handleBookClick(book)}
                  disabled={!isAvailable}
                  className={cn(
                    "relative flex flex-col p-3 rounded-lg border text-left transition-all",
                    "hover:shadow-md hover:border-primary/50",
                    isSelected && "ring-2 ring-primary bg-primary/5 border-primary",
                    !isAvailable && "opacity-50 cursor-not-allowed bg-muted"
                  )}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  
                  {/* Book Cover placeholder */}
                  <div 
                    className="w-full aspect-[3/4] rounded-md mb-2 flex items-center justify-center"
                    style={{ backgroundColor: category?.color || 'hsl(var(--muted))' }}
                  >
                    {book.coverUrl ? (
                      <img 
                        src={book.coverUrl} 
                        alt={book.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <Book className="h-8 w-8 text-white/80" />
                    )}
                  </div>
                  
                  {/* Book Info */}
                  <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                    {book.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {book.author}
                  </p>
                  
                  {/* Availability Badge */}
                  <div className="mt-2 flex items-center justify-between">
                    <Badge 
                      variant={isAvailable ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {isAvailable ? `${book.availableCopies} dispo.` : 'Épuisé'}
                    </Badge>
                    
                    {isAvailable && !isSelected && (
                      <Plus className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
