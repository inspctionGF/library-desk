import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Grid3X3, List, Search, Filter, SlidersHorizontal, Download, ChevronRight, FolderOpen } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/books/BookCard';
import { BookList } from '@/components/books/BookList';
import { BookFormDialog } from '@/components/books/BookFormDialog';
import { DeleteBookDialog } from '@/components/books/DeleteBookDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import { useLibraryStore, Book } from '@/hooks/useLibraryStore';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { books, categories, addBook, updateBook, deleteBook, getCategoryById, getStats } = useLibraryStore();
  const { toast } = useToast();
  const stats = getStats();

  const categoryFromUrl = searchParams.get('category');
  const activeCategory = categoryFromUrl ? getCategoryById(categoryFromUrl) : null;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(categoryFromUrl || 'all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [showStats, setShowStats] = useState(!categoryFromUrl);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Sync categoryFilter with URL param
  useEffect(() => {
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    }
  }, [categoryFromUrl]);

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

  const clearCategoryFilter = () => {
    setSearchParams({});
    setCategoryFilter('all');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Breadcrumb when category is selected */}
        {activeCategory && (
          <nav className="flex items-center gap-2 text-sm">
            <Link 
              to="/categories" 
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <FolderOpen className="h-4 w-4" />
              Catégories
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge 
              variant="secondary" 
              className="font-medium"
              style={{ 
                backgroundColor: `${activeCategory.color}20`, 
                color: activeCategory.color,
                borderColor: activeCategory.color 
              }}
            >
              {activeCategory.name}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs text-muted-foreground"
              onClick={clearCategoryFilter}
            >
              Voir tous les livres
            </Button>
          </nav>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {activeCategory ? activeCategory.name : 'Books'}
            </h1>
            {activeCategory && (
              <p className="text-sm text-muted-foreground">
                {filteredBooks.length} {filteredBooks.length === 1 ? 'livre' : 'livres'} dans cette catégorie
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-border text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Customize
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-border text-muted-foreground">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleAddBook} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Book
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-7 gap-1.5 text-xs"
            >
              <List className="h-3.5 w-3.5" />
              Table View
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-7 gap-1.5 text-xs"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              Grid View
            </Button>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 border-border">
            <Filter className="h-4 w-4" />
            Filter
          </Button>

          <Button variant="outline" size="sm" className="h-9 gap-2 border-border">
            <SlidersHorizontal className="h-4 w-4" />
            Sort
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show Statistics</span>
            <Switch 
              checked={showStats} 
              onCheckedChange={setShowStats}
            />
          </div>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 pl-9 bg-card border-border"
            />
          </div>
        </div>

        {/* Stats Row */}
        {showStats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Books"
              value={stats.totalBooks}
              subtitle="vs last month"
              trend={{ value: '+3 books', positive: true }}
            />
            <StatCard
              title="Available Copies"
              value={stats.availableBooks}
              subtitle="vs last month"
              trend={{ value: '+9%', positive: true }}
            />
            <StatCard
              title="Books Loaned"
              value={stats.activeLoans}
              subtitle="vs last month"
              trend={{ value: '+7%', positive: true }}
            />
            <StatCard
              title="Avg. Monthly Loans"
              value={stats.booksThisWeek * 4}
              subtitle="vs last month"
              trend={{ value: '+5%', positive: true }}
            />
          </div>
        )}

        {/* Book Display */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
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