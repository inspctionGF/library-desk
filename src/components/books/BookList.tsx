import { Edit, Trash2, BookCopy, MoreHorizontal, FileText, ClipboardList, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Book, Category, BookIssue } from '@/hooks/useLibraryStore';
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
  onGenerateResume: (book: Book) => void;
  getBookIssuesByBook?: (bookId: string) => BookIssue[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    itemsPerPage: number;
    goToPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;
  };
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
  onGenerateResume,
  getBookIssuesByBook,
  pagination,
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
            <TableHead className="font-medium text-muted-foreground text-center">Problèmes</TableHead>
            <TableHead className="font-medium text-muted-foreground text-right">+</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => {
            const category = getCategoryById(book.categoryId);
            const stockStatus = getStockStatus(book);
            const isSelected = selectedBooks.includes(book.id);
            const openIssues = getBookIssuesByBook ? getBookIssuesByBook(book.id).filter(i => i.status === 'open') : [];
            const hasIssues = openIssues.length > 0;

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
                <TableCell className="text-center">
                  {hasIssues ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link to={`/book-issues?book=${book.id}`}>
                            <Badge variant="destructive" className="gap-1 cursor-pointer hover:bg-destructive/80">
                              <AlertTriangle className="h-3 w-3" />
                              {openIssues.length}
                            </Badge>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{openIssues.length} problème{openIssues.length > 1 ? 's' : ''} signalé{openIssues.length > 1 ? 's' : ''}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
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
                      <DropdownMenuItem onClick={() => onGenerateResume(book)}>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Fiche de résumé
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
      {pagination && pagination.totalItems > 0 && (
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.goToPage}
          onItemsPerPageChange={pagination.setItemsPerPage}
        />
      )}
    </div>
  );
}