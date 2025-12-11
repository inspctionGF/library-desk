import { useState, useMemo } from "react";
import { useLibraryStore } from "@/hooks/useLibraryStore";
import { parseISO, isWithinInterval, format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, CheckCircle, Clock, Eye, Search } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import ReportStatCard from "./ReportStatCard";
import ReportDateFilter, { DateFilter } from "./ReportDateFilter";
import ExportReportButton from "./ExportReportButton";
import TablePagination from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";

const statusColors = {
  generated: "hsl(var(--muted-foreground))",
  submitted: "hsl(25, 95%, 53%)",
  reviewed: "hsl(174, 72%, 40%)",
};

const statusLabels = {
  generated: "Générée",
  submitted: "Soumise",
  reviewed: "Révisée",
};

const ResumeReportTab = () => {
  const { bookResumes, books, participants } = useLibraryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    type: "all",
    startDate: null,
    endDate: null,
  });

  // Filter resumes by date and status
  const filteredResumes = useMemo(() => {
    let result = bookResumes;

    if (dateFilter.type !== "all" && dateFilter.startDate && dateFilter.endDate) {
      result = result.filter(r => {
        const date = parseISO(r.date);
        return isWithinInterval(date, {
          start: dateFilter.startDate!,
          end: dateFilter.endDate!,
        });
      });
    }

    if (statusFilter !== "all") {
      result = result.filter(r => r.status === statusFilter);
    }

    return result;
  }, [bookResumes, dateFilter, statusFilter]);

  // Enrich with book and participant info
  const enrichedResumes = useMemo(() => {
    return filteredResumes.map(r => {
      const book = books.find(b => b.id === r.bookId);
      const participant = participants.find(p => p.participantNumber === r.participantNumber);
      return {
        ...r,
        bookTitle: book?.title || "Livre inconnu",
        participantName: participant 
          ? `${participant.firstName} ${participant.lastName}` 
          : r.participantNumber,
      };
    });
  }, [filteredResumes, books, participants]);

  // Filter by search
  const searchedResumes = useMemo(() => {
    if (!searchTerm) return enrichedResumes;
    const term = searchTerm.toLowerCase();
    return enrichedResumes.filter(
      r =>
        r.bookTitle.toLowerCase().includes(term) ||
        r.participantName.toLowerCase().includes(term) ||
        r.participantNumber.toLowerCase().includes(term)
    );
  }, [enrichedResumes, searchTerm]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    itemsPerPage,
    setItemsPerPage,
  } = usePagination(searchedResumes, 10);

  // Stats
  const generated = filteredResumes.filter(r => r.status === "generated").length;
  const submitted = filteredResumes.filter(r => r.status === "submitted").length;
  const reviewed = filteredResumes.filter(r => r.status === "reviewed").length;

  // Chart data
  const chartData = [
    { name: "Générées", value: generated, color: statusColors.generated },
    { name: "Soumises", value: submitted, color: statusColors.submitted },
    { name: "Révisées", value: reviewed, color: statusColors.reviewed },
  ].filter(d => d.value > 0);

  // Export data
  const exportData = searchedResumes.map(r => ({
    participantNumber: r.participantNumber,
    participantName: r.participantName,
    book: r.bookTitle,
    date: format(parseISO(r.date), "dd/MM/yyyy"),
    status: statusLabels[r.status as keyof typeof statusLabels],
    rating: r.rating || "-",
  }));

  const exportColumns = [
    { key: "participantNumber", label: "Numéro participant" },
    { key: "participantName", label: "Nom" },
    { key: "book", label: "Livre" },
    { key: "date", label: "Date" },
    { key: "status", label: "Statut" },
    { key: "rating", label: "Note" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReportStatCard
          title="Total résumés"
          value={filteredResumes.length}
          icon={FileText}
          variant="primary"
        />
        <ReportStatCard
          title="Générées"
          value={generated}
          icon={Clock}
        />
        <ReportStatCard
          title="Soumises"
          value={submitted}
          icon={Eye}
          variant="warning"
        />
        <ReportStatCard
          title="Révisées"
          value={reviewed}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Chart and Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Distribution par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune donnée à afficher
              </p>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col space-y-4 pb-4">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Liste des résumés</CardTitle>
              <ExportReportButton
                data={exportData}
                filename="rapport_resumes"
                columns={exportColumns}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <ReportDateFilter value={dateFilter} onChange={setDateFilter} />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="generated">Générées</SelectItem>
                  <SelectItem value="submitted">Soumises</SelectItem>
                  <SelectItem value="reviewed">Révisées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
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
                    <TableHead>Participant</TableHead>
                    <TableHead>Livre</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-center">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Aucun résumé trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((resume) => (
                      <TableRow key={resume.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{resume.participantName}</p>
                            <p className="text-xs text-muted-foreground">{resume.participantNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>{resume.bookTitle}</TableCell>
                        <TableCell>
                          {format(parseISO(resume.date), "dd MMM yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{ 
                              backgroundColor: `${statusColors[resume.status as keyof typeof statusColors]}20`,
                              color: statusColors[resume.status as keyof typeof statusColors],
                            }}
                          >
                            {statusLabels[resume.status as keyof typeof statusLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {resume.rating ? (
                            <Badge variant="outline">{resume.rating}/5</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
              totalItems={searchedResumes.length}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeReportTab;
