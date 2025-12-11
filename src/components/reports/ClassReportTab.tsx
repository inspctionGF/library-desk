import { useState, useMemo } from "react";
import { useLibraryStore } from "@/hooks/useLibraryStore";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { GraduationCap, Users, Calendar, Eye, Search } from "lucide-react";
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
import ClassDetailDialog from "./ClassDetailDialog";
import TablePagination from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";

const ClassReportTab = () => {
  const { classes, classReadingSessions, participants, readingSessions } = useLibraryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Calculate stats for each class
  const classStats = useMemo(() => {
    return classes.map(cls => {
      const classSessions = classReadingSessions.filter(s => s.classId === cls.id);
      const classParticipants = participants.filter(p => p.classId === cls.id);
      const totalAttendees = classSessions.reduce((sum, s) => sum + s.attendeeCount, 0);
      const avgAttendance = classSessions.length > 0 
        ? Math.round(totalAttendees / classSessions.length) 
        : 0;
      const lastSession = classSessions.sort((a, b) => 
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
      )[0];
      
      // Individual reading sessions by participants in this class
      const individualSessions = readingSessions.filter(s => 
        classParticipants.some(p => p.id === s.participantId)
      );

      return {
        ...cls,
        sessionCount: classSessions.length,
        participantCount: classParticipants.length,
        totalAttendees,
        avgAttendance,
        individualSessionCount: individualSessions.length,
        lastSessionDate: lastSession?.sessionDate || null,
      };
    });
  }, [classes, classReadingSessions, participants, readingSessions]);

  // Filter by search
  const filteredClasses = useMemo(() => {
    if (!searchTerm) return classStats;
    const term = searchTerm.toLowerCase();
    return classStats.filter(
      c =>
        c.name.toLowerCase().includes(term) ||
        c.monitorName.toLowerCase().includes(term)
    );
  }, [classStats, searchTerm]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    itemsPerPage,
    setItemsPerPage,
  } = usePagination(filteredClasses, 10);

  // Global stats
  const mostActiveClass = useMemo(() => {
    if (classStats.length === 0) return null;
    return classStats.reduce((max, c) => 
      (c.sessionCount > max.sessionCount ? c : max), classStats[0]);
  }, [classStats]);

  const totalSessions = classReadingSessions.length;
  const totalPresence = classReadingSessions.reduce((sum, s) => sum + s.attendeeCount, 0);

  // Export data
  const exportData = filteredClasses.map(c => ({
    name: c.name,
    ageRange: c.ageRange,
    monitor: c.monitorName,
    participants: c.participantCount,
    sessions: c.sessionCount,
    totalPresents: c.totalAttendees,
    avgAttendance: c.avgAttendance,
    lastSession: c.lastSessionDate ? format(parseISO(c.lastSessionDate), "dd/MM/yyyy") : "-",
  }));

  const exportColumns = [
    { key: "name", label: "Classe" },
    { key: "ageRange", label: "Tranche d'âge" },
    { key: "monitor", label: "Moniteur" },
    { key: "participants", label: "Participants" },
    { key: "sessions", label: "Sessions" },
    { key: "totalPresents", label: "Total présents" },
    { key: "avgAttendance", label: "Moyenne présence" },
    { key: "lastSession", label: "Dernière session" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReportStatCard
          title="Classe la plus active"
          value={mostActiveClass?.name || "-"}
          subtitle={mostActiveClass ? `${mostActiveClass.sessionCount} sessions` : undefined}
          icon={GraduationCap}
          variant="primary"
        />
        <ReportStatCard
          title="Total sessions de classe"
          value={totalSessions}
          icon={Calendar}
        />
        <ReportStatCard
          title="Total présences"
          value={totalPresence}
          icon={Users}
          variant="success"
        />
        <ReportStatCard
          title="Nombre de classes"
          value={classes.length}
          icon={GraduationCap}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">Rapport par classe</CardTitle>
          <ExportReportButton
            data={exportData}
            filename="rapport_classes"
            columns={exportColumns}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Classe</TableHead>
                  <TableHead>Tranche d'âge</TableHead>
                  <TableHead>Moniteur</TableHead>
                  <TableHead className="text-center">Participants</TableHead>
                  <TableHead className="text-center">Sessions</TableHead>
                  <TableHead className="text-center">Moy. présence</TableHead>
                  <TableHead>Dernière session</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Aucune classe trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cls.ageRange} ans</Badge>
                      </TableCell>
                      <TableCell>{cls.monitorName}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{cls.participantCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{cls.sessionCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {cls.avgAttendance}
                      </TableCell>
                      <TableCell>
                        {cls.lastSessionDate 
                          ? format(parseISO(cls.lastSessionDate), "dd MMM yyyy", { locale: fr })
                          : "-"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedClassId(cls.id)}
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
            totalItems={filteredClasses.length}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedClassId && (
        <ClassDetailDialog
          classId={selectedClassId}
          open={!!selectedClassId}
          onOpenChange={(open) => !open && setSelectedClassId(null)}
        />
      )}
    </div>
  );
};

export default ClassReportTab;
