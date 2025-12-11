import { useMemo } from "react";
import { useLibraryStore } from "@/hooks/useLibraryStore";
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Users, HandCoins } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BookDetailDialogProps {
  bookId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookDetailDialog = ({ bookId, open, onOpenChange }: BookDetailDialogProps) => {
  const { books, categories, readingSessions, loans, participants, otherReaders } = useLibraryStore();

  const book = books.find(b => b.id === bookId);
  const category = categories.find(c => c.id === book?.categoryId);

  // Get readers (participants who read this book)
  const readers = useMemo(() => {
    const sessions = readingSessions.filter(s => s.bookId === bookId);
    const participantIds = [...new Set(sessions.map(s => s.participantId))];
    return participantIds.map(id => {
      const participant = participants.find(p => p.id === id);
      const sessionsCount = sessions.filter(s => s.participantId === id).length;
      return {
        id,
        name: participant ? `${participant.firstName} ${participant.lastName}` : "Inconnu",
        number: participant?.participantNumber || "",
        sessionsCount,
      };
    }).sort((a, b) => b.sessionsCount - a.sessionsCount);
  }, [readingSessions, participants, bookId]);

  // Get borrowers
  const borrowers = useMemo(() => {
    const bookLoans = loans.filter(l => l.bookId === bookId);
    return bookLoans.map(loan => {
      let name = loan.borrowerName;
      let type = loan.borrowerType === "participant" ? "Participant" : "Autre lecteur";
      
      return {
        id: loan.id,
        name,
        type,
        date: loan.loanDate,
        status: loan.status,
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [loans, bookId]);

  // Monthly activity chart data (last 6 months)
  const chartData = useMemo(() => {
    const months: { name: string; lectures: number; prets: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const reads = readingSessions.filter(s => {
        const d = parseISO(s.sessionDate);
        return s.bookId === bookId && d >= start && d <= end;
      }).length;
      
      const borrows = loans.filter(l => {
        const d = parseISO(l.loanDate);
        return l.bookId === bookId && d >= start && d <= end;
      }).length;
      
      months.push({
        name: format(date, "MMM", { locale: fr }),
        lectures: reads,
        prets: borrows,
      });
    }
    
    return months;
  }, [readingSessions, loans, bookId]);

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Détails du livre
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="space-y-6 pr-4">
            {/* Book Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-32 bg-muted rounded-lg flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold">{book.title}</h3>
                    <p className="text-muted-foreground">{book.author}</p>
                    {book.isbn && (
                      <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {category && (
                        <Badge style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                          {category.name}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {book.availableCopies}/{book.quantity} disponibles
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{readers.length}</p>
                    <p className="text-sm text-muted-foreground">Lecteurs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {readingSessions.filter(s => s.bookId === bookId).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Sessions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{borrowers.length}</p>
                    <p className="text-sm text-muted-foreground">Prêts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activité des 6 derniers mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="lectures"
                        name="Lectures"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="prets"
                        name="Prêts"
                        stroke="hsl(174, 72%, 40%)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Readers List */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Users className="h-4 w-4" />
                <CardTitle className="text-base">Participants ayant lu ce livre ({readers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {readers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun participant n'a encore lu ce livre
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {readers.map((reader) => (
                      <div
                        key={reader.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{reader.name}</p>
                          <p className="text-xs text-muted-foreground">{reader.number}</p>
                        </div>
                        <Badge variant="secondary">{reader.sessionsCount} session(s)</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Borrowers List */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <HandCoins className="h-4 w-4" />
                <CardTitle className="text-base">Historique des emprunts ({borrowers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {borrowers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun emprunt enregistré
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {borrowers.map((borrower) => (
                      <div
                        key={borrower.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{borrower.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {borrower.type} • {format(parseISO(borrower.date), "dd MMM yyyy", { locale: fr })}
                          </p>
                        </div>
                        <Badge
                          variant={
                            borrower.status === "returned"
                              ? "secondary"
                              : borrower.status === "overdue"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {borrower.status === "returned"
                            ? "Retourné"
                            : borrower.status === "overdue"
                            ? "En retard"
                            : "Actif"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BookDetailDialog;
