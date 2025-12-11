import { useState, useMemo } from "react";
import { useLibraryStore, Loan } from "@/hooks/useLibraryStore";
import { parseISO, isWithinInterval, format } from "date-fns";
import { fr } from "date-fns/locale";
import { HandCoins, Trophy, AlertTriangle, UserX, Search, CheckCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportStatCard from "./ReportStatCard";
import ReportDateFilter, { DateFilter } from "./ReportDateFilter";
import ExportReportButton from "./ExportReportButton";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";

interface BorrowerStat {
  id: string;
  name: string;
  type: string;
  loanCount: number;
}

interface LoanDisplay extends Loan {
  bookTitle: string;
}

interface NeverBorrowedDisplay {
  id: string;
  number: string;
  name: string;
  type: string;
  loanCount: number;
}

type DisplayItem = BorrowerStat | LoanDisplay | NeverBorrowedDisplay;

const LoanReportTab = () => {
  const { loans, participants, books } = useLibraryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    type: "all",
    startDate: null,
    endDate: null,
  });
  const [activeSubTab, setActiveSubTab] = useState("all");

  // Filter loans by date
  const filteredLoans = useMemo(() => {
    if (dateFilter.type === "all" || !dateFilter.startDate || !dateFilter.endDate) {
      return loans;
    }
    return loans.filter(l => {
      const date = parseISO(l.loanDate);
      return isWithinInterval(date, {
        start: dateFilter.startDate!,
        end: dateFilter.endDate!,
      });
    });
  }, [loans, dateFilter]);

  // Get all borrowers (participants + other readers)
  const allBorrowers = useMemo(() => {
    const borrowerMap = new Map<string, BorrowerStat>();

    filteredLoans.forEach(loan => {
      const key = `${loan.borrowerType}-${loan.borrowerId}`;
      if (borrowerMap.has(key)) {
        borrowerMap.get(key)!.loanCount++;
      } else {
        borrowerMap.set(key, {
          id: loan.borrowerId,
          name: loan.borrowerName,
          type: loan.borrowerType === "participant" ? "Participant" : "Autre lecteur",
          loanCount: 1,
        });
      }
    });

    return Array.from(borrowerMap.values());
  }, [filteredLoans]);

  // Top 10 borrowers
  const topBorrowers = useMemo(() => {
    return [...allBorrowers]
      .sort((a, b) => b.loanCount - a.loanCount)
      .slice(0, 10);
  }, [allBorrowers]);

  // Never borrowed (participants only)
  const neverBorrowed = useMemo(() => {
    const borrowerIds = new Set(
      filteredLoans
        .filter(l => l.borrowerType === "participant")
        .map(l => l.borrowerId)
    );
    return participants.filter(p => !borrowerIds.has(p.id));
  }, [filteredLoans, participants]);

  // Loan stats
  const activeLoans = filteredLoans.filter(l => l.status === "active").length;
  const overdueLoans = filteredLoans.filter(l => l.status === "overdue").length;

  // Build display data based on active tab
  const displayData: DisplayItem[] = useMemo(() => {
    if (activeSubTab === "top10") {
      return topBorrowers.map((b, idx) => ({
        id: b.id,
        rank: idx + 1,
        name: b.name,
        type: b.type,
        loanCount: b.loanCount,
      }));
    }
    if (activeSubTab === "never") {
      return neverBorrowed.map(p => ({
        id: p.id,
        number: p.participantNumber,
        name: `${p.firstName} ${p.lastName}`,
        type: "Participant",
        loanCount: 0,
      }));
    }
    // All loans
    return filteredLoans.map(l => {
      const book = books.find(b => b.id === l.bookId);
      return {
        ...l,
        bookTitle: book?.title || "Livre inconnu",
      };
    });
  }, [activeSubTab, topBorrowers, neverBorrowed, filteredLoans, books]);

  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchTerm) return displayData;
    const term = searchTerm.toLowerCase();
    return displayData.filter((item) => {
      const searchFields = [
        (item as any).name,
        (item as any).borrowerName,
        (item as any).bookTitle,
        (item as any).number,
      ].filter(Boolean);
      return searchFields.some(f => f?.toLowerCase().includes(term));
    });
  }, [displayData, searchTerm]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    itemsPerPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination<DisplayItem>({ data: filteredData, itemsPerPage: 10 });

  // Export data
  const getExportData = () => {
    if (activeSubTab === "top10") {
      return topBorrowers.map((b, idx) => ({
        rank: idx + 1,
        name: b.name,
        type: b.type,
        loanCount: b.loanCount,
      }));
    }
    if (activeSubTab === "never") {
      return neverBorrowed.map(p => ({
        number: p.participantNumber,
        name: `${p.firstName} ${p.lastName}`,
        age: p.age,
        gender: p.gender === "M" ? "Masculin" : "Féminin",
      }));
    }
    return filteredLoans.map(l => {
      const book = books.find(b => b.id === l.bookId);
      return {
        borrower: l.borrowerName,
        type: l.borrowerType === "participant" ? "Participant" : "Autre lecteur",
        book: book?.title || "",
        loanDate: format(parseISO(l.loanDate), "dd/MM/yyyy"),
        dueDate: format(parseISO(l.dueDate), "dd/MM/yyyy"),
        returnDate: l.returnDate ? format(parseISO(l.returnDate), "dd/MM/yyyy") : "-",
        status: l.status === "active" ? "Actif" : l.status === "overdue" ? "En retard" : "Retourné",
      };
    });
  };

  const getExportColumns = () => {
    if (activeSubTab === "top10") {
      return [
        { key: "rank", label: "Rang" },
        { key: "name", label: "Nom" },
        { key: "type", label: "Type" },
        { key: "loanCount", label: "Emprunts" },
      ];
    }
    if (activeSubTab === "never") {
      return [
        { key: "number", label: "Numéro" },
        { key: "name", label: "Nom" },
        { key: "age", label: "Âge" },
        { key: "gender", label: "Genre" },
      ];
    }
    return [
      { key: "borrower", label: "Emprunteur" },
      { key: "type", label: "Type" },
      { key: "book", label: "Livre" },
      { key: "loanDate", label: "Date prêt" },
      { key: "dueDate", label: "Date retour prévue" },
      { key: "returnDate", label: "Date retour" },
      { key: "status", label: "Statut" },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReportStatCard
          title="Total prêts"
          value={filteredLoans.length}
          icon={HandCoins}
          variant="primary"
        />
        <ReportStatCard
          title="Prêts actifs"
          value={activeLoans}
          icon={CheckCircle}
          variant="success"
        />
        <ReportStatCard
          title="En retard"
          value={overdueLoans}
          icon={AlertTriangle}
          variant="destructive"
        />
        <ReportStatCard
          title="Top emprunteur"
          value={topBorrowers[0]?.name || "-"}
          subtitle={topBorrowers[0] ? `${topBorrowers[0].loanCount} emprunts` : undefined}
          icon={Trophy}
          variant="warning"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-col space-y-4 pb-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Rapport des prêts</CardTitle>
            <ExportReportButton
              data={getExportData()}
              filename={`rapport_prets_${activeSubTab}`}
              columns={getExportColumns()}
            />
          </div>
          <ReportDateFilter value={dateFilter} onChange={setDateFilter} />
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
            <TabsList>
              <TabsTrigger value="all">Tous ({filteredLoans.length})</TabsTrigger>
              <TabsTrigger value="top10">
                <Trophy className="h-4 w-4 mr-1" />
                Top 10
              </TabsTrigger>
              <TabsTrigger value="never">
                <UserX className="h-4 w-4 mr-1" />
                Sans emprunt ({neverBorrowed.length})
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {activeSubTab === "top10" && <TableHead className="w-12">#</TableHead>}
                      {activeSubTab === "never" && <TableHead>Numéro</TableHead>}
                      <TableHead>
                        {activeSubTab === "all" ? "Emprunteur" : "Nom"}
                      </TableHead>
                      {activeSubTab === "all" && <TableHead>Livre</TableHead>}
                      {activeSubTab === "all" && <TableHead>Date prêt</TableHead>}
                      {activeSubTab === "all" && <TableHead>Statut</TableHead>}
                      {activeSubTab !== "all" && (
                        <TableHead className="text-center">
                          {activeSubTab === "top10" ? "Emprunts" : "Type"}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={activeSubTab === "all" ? 4 : 3} 
                          className="text-center text-muted-foreground py-8"
                        >
                          Aucune donnée trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((item, idx) => (
                        <TableRow key={(item as any).id}>
                          {activeSubTab === "top10" && (
                            <TableCell>
                              <Badge 
                                variant={idx < 3 ? "default" : "secondary"}
                                className={
                                  idx === 0 ? "bg-yellow-500" : 
                                  idx === 1 ? "bg-gray-400" : 
                                  idx === 2 ? "bg-amber-600" : ""
                                }
                              >
                                {(item as any).rank || (currentPage - 1) * itemsPerPage + idx + 1}
                              </Badge>
                            </TableCell>
                          )}
                          {activeSubTab === "never" && (
                            <TableCell className="font-mono text-sm">
                              {(item as NeverBorrowedDisplay).number}
                            </TableCell>
                          )}
                          <TableCell className="font-medium">
                            {(item as any).name || (item as LoanDisplay).borrowerName}
                          </TableCell>
                          {activeSubTab === "all" && (
                            <>
                              <TableCell>{(item as LoanDisplay).bookTitle}</TableCell>
                              <TableCell>
                                {format(parseISO((item as LoanDisplay).loanDate), "dd MMM yyyy", { locale: fr })}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    (item as LoanDisplay).status === "returned"
                                      ? "secondary"
                                      : (item as LoanDisplay).status === "overdue"
                                      ? "destructive"
                                      : "default"
                                  }
                                >
                                  {(item as LoanDisplay).status === "returned"
                                    ? "Retourné"
                                    : (item as LoanDisplay).status === "overdue"
                                    ? "En retard"
                                    : "Actif"}
                                </Badge>
                              </TableCell>
                            </>
                          )}
                          {activeSubTab !== "all" && (
                            <TableCell className="text-center">
                              {activeSubTab === "top10" ? (
                                <Badge variant="default">{(item as BorrowerStat).loanCount}</Badge>
                              ) : (
                                <Badge variant="secondary">{(item as NeverBorrowedDisplay).type}</Badge>
                              )}
                            </TableCell>
                          )}
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
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
              />
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanReportTab;
