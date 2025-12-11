import { useState, useMemo } from "react";
import { useLibraryStore } from "@/hooks/useLibraryStore";
import { BookOpen, TrendingUp, Users, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReportStatCard from "./ReportStatCard";
import ExportReportButton from "./ExportReportButton";
import BookDetailDialog from "./BookDetailDialog";
import TablePagination from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";

const BookReportTab = () => {
  const { books, categories, readingSessions, loans } = useLibraryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Calculate stats for each book
  const bookStats = useMemo(() => {
    return books.map(book => {
      const readCount = readingSessions.filter(s => s.bookId === book.id).length;
      const loanCount = loans.filter(l => l.bookId === book.id).length;
      const category = categories.find(c => c.id === book.categoryId);
      
      return {
        ...book,
        readCount,
        loanCount,
        categoryName: category?.name || "Non classé",
        categoryColor: category?.color || "hsl(0, 0%, 50%)",
      };
    });
  }, [books, categories, readingSessions, loans]);

  // Filter by search
  const filteredBooks = useMemo(() => {
    if (!searchTerm) return bookStats;
    const term = searchTerm.toLowerCase();
    return bookStats.filter(
      b =>
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        b.categoryName.toLowerCase().includes(term)
    );
  }, [bookStats, searchTerm]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    itemsPerPage,
    setItemsPerPage,
  } = usePagination(filteredBooks, 10);

  // Calculate global stats
  const mostReadBook = useMemo(() => {
    if (bookStats.length === 0) return null;
    return bookStats.reduce((max, b) => (b.readCount > max.readCount ? b : max), bookStats[0]);
  }, [bookStats]);

  const mostBorrowedBook = useMemo(() => {
    if (bookStats.length === 0) return null;
    return bookStats.reduce((max, b) => (b.loanCount > max.loanCount ? b : max), bookStats[0]);
  }, [bookStats]);

  const totalReads = readingSessions.length;
  const totalLoans = loans.length;

  // Export data
  const exportData = filteredBooks.map(b => ({
    title: b.title,
    author: b.author,
    category: b.categoryName,
    readCount: b.readCount,
    loanCount: b.loanCount,
    quantity: b.quantity,
    available: b.availableCopies,
  }));

  const exportColumns = [
    { key: "title", label: "Titre" },
    { key: "author", label: "Auteur" },
    { key: "category", label: "Catégorie" },
    { key: "readCount", label: "Lectures" },
    { key: "loanCount", label: "Prêts" },
    { key: "quantity", label: "Quantité" },
    { key: "available", label: "Disponible" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReportStatCard
          title="Livre le plus lu"
          value={mostReadBook?.title || "-"}
          subtitle={mostReadBook ? `${mostReadBook.readCount} lectures` : undefined}
          icon={TrendingUp}
          variant="primary"
        />
        <ReportStatCard
          title="Livre le plus emprunté"
          value={mostBorrowedBook?.title || "-"}
          subtitle={mostBorrowedBook ? `${mostBorrowedBook.loanCount} prêts` : undefined}
          icon={BookOpen}
          variant="success"
        />
        <ReportStatCard
          title="Total sessions lecture"
          value={totalReads}
          icon={Users}
        />
        <ReportStatCard
          title="Total prêts"
          value={totalLoans}
          icon={BookOpen}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">Rapport par livre</CardTitle>
          <ExportReportButton
            data={exportData}
            filename="rapport_livres"
            columns={exportColumns}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un livre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-center">Lectures</TableHead>
                  <TableHead className="text-center">Prêts</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucun livre trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: `${book.categoryColor}20`, color: book.categoryColor }}
                        >
                          {book.categoryName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{book.readCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{book.loanCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBookId(book.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredBooks.length}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedBookId && (
        <BookDetailDialog
          bookId={selectedBookId}
          open={!!selectedBookId}
          onOpenChange={(open) => !open && setSelectedBookId(null)}
        />
      )}
    </div>
  );
};

export default BookReportTab;
