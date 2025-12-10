import { useState, useMemo } from 'react';
import { Plus, Grid3X3, List, Search, Filter } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookCard } from '@/components/books/BookCard';
import { BookList } from '@/components/books/BookList';
import { BookFormDialog } from '@/components/books/BookFormDialog';
import { DeleteBookDialog } from '@/components/books/DeleteBookDialog';
import { useLibraryStore, Book } from '@/hooks/useLibraryStore';
import { useToast } from '@/hooks/use-toast';

export default function Books() {
  const { books, categories, addBook, updateBook, deleteBook, getCategoryById } = useLibraryStore();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || book.categoryId === categoryFilter;
      
      const matchesAvailability = 
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && book.availableCopies > 0) ||
        (availabilityFilter === 'unavailable' && book.availableCopies === 0);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [books, searchQuery, categoryFilter, availabilityFilter]);

  const handleAddBook = () => {
    setEditingBook(null);
    setFormOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setFormOpen(true);
  };

  const handleDeleteBook = (book: Book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleLoanBook = (book: Book) => {
    toast({
      title: 'Coming Soon',
      description: 'Loan functionality will be available in Phase 2.',
    });
  };

  const handleFormSubmit = (data: Omit<Book, 'id' | 'createdAt' | 'availableCopies'>) => {
    if (editingBook) {
      updateBook(editingBook.id, data);
      toast({
        title: 'Book Updated',
        description: `"${data.title}" has been updated.`,
      });
    } else {
      addBook(data);
      toast({
        title: 'Book Added',
        description: `"${data.title}" has been added to the catalog.`,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (bookToDelete) {
      deleteBook(bookToDelete.id);
      toast({
        title: 'Book Deleted',
        description: `"${bookToDelete.title}" has been removed.`,
      });
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Book Catalog</h1>
            <p className="text-muted-foreground">
              {filteredBooks.length} of {books.length} books
            </p>
          </div>
          <Button onClick={handleAddBook} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Book
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Books</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Book Display */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No books found matching your criteria.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                category={getCategoryById(book.categoryId)}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
                onLoan={handleLoanBook}
              />
            ))}
          </div>
        ) : (
          <BookList
            books={filteredBooks}
            categories={categories}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
            onLoan={handleLoanBook}
          />
        )}
      </div>

      {/* Dialogs */}
      <BookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        book={editingBook}
        categories={categories}
        onSubmit={handleFormSubmit}
      />
      <DeleteBookDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        book={bookToDelete}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}
