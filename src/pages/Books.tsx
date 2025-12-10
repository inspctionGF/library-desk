import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Grid3X3, List, Search, Filter, Download, ChevronRight, FolderOpen, Upload, ArrowUpDown, FileText, X } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/books/BookCard';
import { BookList } from '@/components/books/BookList';
import { BookFormDialog } from '@/components/books/BookFormDialog';
import { DeleteBookDialog } from '@/components/books/DeleteBookDialog';
import { ImportBooksDialog } from '@/components/books/ImportBooksDialog';
import { ExportBookSheetDialog } from '@/components/books/ExportBookSheetDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import { useLibraryStore, Book } from '@/hooks/useLibraryStore';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortField = 'title' | 'author' | 'createdAt' | 'quantity';
type SortOrder = 'asc' | 'desc';

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

  // Sort state
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Bulk selection and export sheet
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [exportSheetDialogOpen, setExportSheetDialogOpen] = useState(false);
  const [booksToExport, setBooksToExport] = useState<Book[]>([]);

  // Sync categoryFilter with URL param
  useEffect(() => {
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  const filteredAndSortedBooks = useMemo(() => {
    let result = books.filter((book) => {
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

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [books, searchQuery, categoryFilter, availabilityFilter, sortField, sortOrder]);

  const activeFiltersCount = (categoryFilter !== 'all' && !categoryFromUrl ? 1 : 0) + (availabilityFilter !== 'all' ? 1 : 0);

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

  // Selection handlers
  const handleSelectBook = (bookId: string) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    const allBookIds = filteredAndSortedBooks.map(b => b.id);
    const allSelected = allBookIds.every(id => selectedBooks.includes(id));
    
    if (allSelected) {
      setSelectedBooks(prev => prev.filter(id => !allBookIds.includes(id)));
    } else {
      setSelectedBooks(prev => [...new Set([...prev, ...allBookIds])]);
    }
  };

  const handleClearSelection = () => {
    setSelectedBooks([]);
  };

  // Export sheet handlers
  const handleExportSheet = (book: Book) => {
    setBooksToExport([book]);
    setExportSheetDialogOpen(true);
  };

  const handleBulkExportSheets = () => {
    const booksForExport = books.filter(b => selectedBooks.includes(b.id));
    setBooksToExport(booksForExport);
    setExportSheetDialogOpen(true);
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

  const handleImportBooks = (importedBooks: Array<Omit<Book, 'id' | 'createdAt' | 'availableCopies'>>) => {
    importedBooks.forEach(book => addBook(book));
    toast({
      title: 'Books Imported',
      description: `${importedBooks.length} books have been imported successfully.`,
    });
  };

  const handleExportCSV = () => {
    const booksToExport = filteredAndSortedBooks;
    
    // CSV headers
    const headers = ['Title', 'Author', 'ISBN', 'Category', 'Quantity', 'Available Copies', 'Cover URL', 'Date Added'];
    
    // Build CSV rows
    const rows = booksToExport.map(book => {
      const category = getCategoryById(book.categoryId);
      return [
        `"${book.title.replace(/"/g, '""')}"`,
        `"${book.author.replace(/"/g, '""')}"`,
        `"${book.isbn}"`,
        `"${category?.name || ''}"`,
        book.quantity.toString(),
        book.availableCopies.toString(),
        `"${book.coverUrl}"`,
        book.createdAt,
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `books-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export réussi',
      description: `${booksToExport.length} livres exportés en CSV.`,
    });
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
                {filteredAndSortedBooks.length} {filteredAndSortedBooks.length === 1 ? 'livre' : 'livres'} dans cette catégorie
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-border text-muted-foreground"
              onClick={() => setImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-border text-muted-foreground"
              onClick={handleExportCSV}
            >
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

          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 border-border relative">
                <Filter className="h-4 w-4" />
                Filter
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: cat.color }} 
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setCategoryFilter('all');
                      setAvailabilityFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 border-border">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Sort by</Label>
                {[
                  { value: 'title', label: 'Title' },
                  { value: 'author', label: 'Author' },
                  { value: 'createdAt', label: 'Date Added' },
                  { value: 'quantity', label: 'Quantity' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => {
                      if (sortField === option.value) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField(option.value as SortField);
                        setSortOrder('asc');
                      }
                    }}
                  >
                    {option.label}
                    {sortField === option.value && (
                      <span className="text-xs text-muted-foreground">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

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
        {/* Bulk Selection Toolbar */}
        {selectedBooks.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <span className="text-sm font-medium text-foreground">
              {selectedBooks.length} livre{selectedBooks.length > 1 ? 's' : ''} sélectionné{selectedBooks.length > 1 ? 's' : ''}
            </span>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={handleClearSelection}>
              <X className="h-4 w-4 mr-2" />
              Désélectionner
            </Button>
            <Button size="sm" onClick={handleBulkExportSheets}>
              <FileText className="h-4 w-4 mr-2" />
              Exporter fiches
            </Button>
          </div>
        )}

        {filteredAndSortedBooks.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">No books found matching your criteria.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredAndSortedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                category={getCategoryById(book.categoryId)}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
                onLoan={handleLoanBook}
                onExportSheet={handleExportSheet}
              />
            ))}
          </div>
        ) : (
          <BookList
            books={filteredAndSortedBooks}
            categories={categories}
            selectedBooks={selectedBooks}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
            onLoan={handleLoanBook}
            onSelectBook={handleSelectBook}
            onSelectAll={handleSelectAll}
            onExportSheet={handleExportSheet}
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
      <ImportBooksDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        categories={categories}
        onImport={handleImportBooks}
      />
      <ExportBookSheetDialog
        open={exportSheetDialogOpen}
        onOpenChange={setExportSheetDialogOpen}
        books={booksToExport}
        categories={categories}
        getCategoryById={getCategoryById}
      />
    </AdminLayout>
  );
}