import { useState, useMemo } from "react";
import { useLibraryStore, Participant } from "@/hooks/useLibraryStore";
import { parseISO, isWithinInterval } from "date-fns";
import { Users, Trophy, BookOpen, UserX, Search } from "lucide-react";
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

interface ParticipantStat extends Participant {
  fullName: string;
  className: string;
  readCount: number;
}

const ParticipantReportTab = () => {
  const { participants, readingSessions, classes } = useLibraryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    type: "all",
    startDate: null,
    endDate: null,
  });
  const [activeSubTab, setActiveSubTab] = useState("all");

  // Filter sessions by date
  const filteredSessions = useMemo(() => {
    if (dateFilter.type === "all" || !dateFilter.startDate || !dateFilter.endDate) {
      return readingSessions;
    }
    return readingSessions.filter(s => {
      const date = parseISO(s.sessionDate);
      return isWithinInterval(date, {
        start: dateFilter.startDate!,
        end: dateFilter.endDate!,
      });
    });
  }, [readingSessions, dateFilter]);

  // Calculate stats for each participant
  const participantStats: ParticipantStat[] = useMemo(() => {
    return participants.map(p => {
      const sessions = filteredSessions.filter(s => s.participantId === p.id);
      const cls = classes.find(c => c.id === p.classId);
      return {
        ...p,
        fullName: `${p.firstName} ${p.lastName}`,
        className: cls?.name || "Non assigné",
        readCount: sessions.length,
      };
    });
  }, [participants, filteredSessions, classes]);

  // Top 10 readers
  const topReaders = useMemo(() => {
    return [...participantStats]
      .sort((a, b) => b.readCount - a.readCount)
      .slice(0, 10);
  }, [participantStats]);

  // Never read
  const neverRead = useMemo(() => {
    return participantStats.filter(p => p.readCount === 0);
  }, [participantStats]);

  // Filter by search
  const filteredParticipants = useMemo(() => {
    let data = participantStats;
    if (activeSubTab === "top10") data = topReaders;
    if (activeSubTab === "never") data = neverRead;
    
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(
      p =>
        p.fullName.toLowerCase().includes(term) ||
        p.participantNumber.toLowerCase().includes(term) ||
        p.className.toLowerCase().includes(term)
    );
  }, [participantStats, topReaders, neverRead, activeSubTab, searchTerm]);

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
  } = usePagination<ParticipantStat>({ data: filteredParticipants, itemsPerPage: 10 });

  // Global stats
  const totalReads = filteredSessions.length;
  const activeReaders = participantStats.filter(p => p.readCount > 0).length;

  // Export data
  const exportData = filteredParticipants.map(p => ({
    number: p.participantNumber,
    name: p.fullName,
    class: p.className,
    age: p.age,
    ageRange: p.ageRange,
    gender: p.gender === "M" ? "Masculin" : "Féminin",
    readCount: p.readCount,
  }));

  const exportColumns = [
    { key: "number", label: "Numéro" },
    { key: "name", label: "Nom" },
    { key: "class", label: "Classe" },
    { key: "age", label: "Âge" },
    { key: "ageRange", label: "Tranche" },
    { key: "gender", label: "Genre" },
    { key: "readCount", label: "Lectures" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReportStatCard
          title="Total sessions lecture"
          value={totalReads}
          icon={BookOpen}
          variant="primary"
        />
        <ReportStatCard
          title="Lecteurs actifs"
          value={activeReaders}
          subtitle={`sur ${participants.length} participants`}
          icon={Users}
          variant="success"
        />
        <ReportStatCard
          title="Meilleur lecteur"
          value={topReaders[0]?.fullName || "-"}
          subtitle={topReaders[0] ? `${topReaders[0].readCount} lectures` : undefined}
          icon={Trophy}
          variant="warning"
        />
        <ReportStatCard
          title="Sans lecture"
          value={neverRead.length}
          icon={UserX}
          variant="destructive"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-col space-y-4 pb-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Rapport des lectures</CardTitle>
            <ExportReportButton
              data={exportData}
              filename="rapport_lectures_participants"
              columns={exportColumns}
            />
          </div>
          <ReportDateFilter value={dateFilter} onChange={setDateFilter} />
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
            <TabsList>
              <TabsTrigger value="all">Tous ({participantStats.length})</TabsTrigger>
              <TabsTrigger value="top10">
                <Trophy className="h-4 w-4 mr-1" />
                Top 10
              </TabsTrigger>
              <TabsTrigger value="never">
                <UserX className="h-4 w-4 mr-1" />
                Sans lecture ({neverRead.length})
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un participant..."
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
                      <TableHead>Numéro</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead className="text-center">Âge</TableHead>
                      <TableHead className="text-center">Lectures</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={activeSubTab === "top10" ? 6 : 5} 
                          className="text-center text-muted-foreground py-8"
                        >
                          Aucun participant trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((p, idx) => (
                        <TableRow key={p.id}>
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
                                {(currentPage - 1) * itemsPerPage + idx + 1}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell className="font-mono text-sm">
                            {p.participantNumber}
                          </TableCell>
                          <TableCell className="font-medium">{p.fullName}</TableCell>
                          <TableCell>{p.className}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{p.age} ans</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={p.readCount > 0 ? "default" : "secondary"}
                              className={p.readCount === 0 ? "text-muted-foreground" : ""}
                            >
                              {p.readCount}
                            </Badge>
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

export default ParticipantReportTab;
