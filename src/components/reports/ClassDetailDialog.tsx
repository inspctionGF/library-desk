import { useMemo } from "react";
import { useLibraryStore } from "@/hooks/useLibraryStore";
import { format, parseISO } from "date-fns";
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
import { GraduationCap, Users, Calendar, BookOpen } from "lucide-react";
import ExportReportButton from "./ExportReportButton";

interface ClassDetailDialogProps {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClassDetailDialog = ({ classId, open, onOpenChange }: ClassDetailDialogProps) => {
  const { classes, classReadingSessions, participants, readingSessions, books } = useLibraryStore();

  const cls = classes.find(c => c.id === classId);
  const classParticipants = participants.filter(p => p.classId === classId);

  // Sessions for this class
  const sessions = useMemo(() => {
    return classReadingSessions
      .filter(s => s.classId === classId)
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
      .map(session => {
        // Get individual reading sessions linked to this class session
        const linkedSessions = readingSessions.filter(rs => rs.classSessionId === session.id);
        const participantsPresent = linkedSessions.map(ls => {
          const participant = participants.find(p => p.id === ls.participantId);
          const book = books.find(b => b.id === ls.bookId);
          return {
            name: participant ? `${participant.firstName} ${participant.lastName}` : "Inconnu",
            book: book?.title || "Livre inconnu",
          };
        });

        return {
          ...session,
          participantsPresent,
        };
      });
  }, [classReadingSessions, readingSessions, participants, books, classId]);

  // Export data for sessions
  const exportData = sessions.flatMap(session => {
    if (session.participantsPresent.length === 0) {
      return [{
        date: format(parseISO(session.sessionDate), "dd/MM/yyyy"),
        type: session.sessionType === "bulk" ? "Rapide" : "Détaillé",
        attendees: session.attendeeCount,
        participant: "-",
        book: "-",
        notes: session.notes || "",
      }];
    }
    return session.participantsPresent.map((p, idx) => ({
      date: idx === 0 ? format(parseISO(session.sessionDate), "dd/MM/yyyy") : "",
      type: idx === 0 ? (session.sessionType === "bulk" ? "Rapide" : "Détaillé") : "",
      attendees: idx === 0 ? session.attendeeCount : "",
      participant: p.name,
      book: p.book,
      notes: idx === 0 ? (session.notes || "") : "",
    }));
  });

  const exportColumns = [
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
    { key: "attendees", label: "Présents" },
    { key: "participant", label: "Participant" },
    { key: "book", label: "Livre lu" },
    { key: "notes", label: "Notes" },
  ];

  if (!cls) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Détails de la classe
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="space-y-6 pr-4">
            {/* Class Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{cls.name}</h3>
                      <p className="text-muted-foreground">Moniteur: {cls.monitorName}</p>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {cls.ageRange} ans
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{classParticipants.length}</p>
                      <p className="text-sm text-muted-foreground">Participants</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{sessions.length}</p>
                      <p className="text-sm text-muted-foreground">Sessions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {sessions.reduce((sum, s) => sum + s.attendeeCount, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total présences</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants List */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Users className="h-4 w-4" />
                <CardTitle className="text-base">
                  Participants inscrits ({classParticipants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classParticipants.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun participant dans cette classe
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {classParticipants.map((p) => (
                      <Badge key={p.id} variant="secondary">
                        {p.firstName} {p.lastName}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sessions History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <CardTitle className="text-base">
                    Historique des sessions ({sessions.length})
                  </CardTitle>
                </div>
                <ExportReportButton
                  data={exportData}
                  filename={`rapport_classe_${cls.name.replace(/\s/g, "_")}`}
                  columns={exportColumns}
                />
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune session enregistrée
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 rounded-lg bg-muted/50 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {format(parseISO(session.sessionDate), "EEEE dd MMMM yyyy", { locale: fr })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={session.sessionType === "bulk" ? "secondary" : "default"}>
                              {session.sessionType === "bulk" ? "Rapide" : "Détaillé"}
                            </Badge>
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              {session.attendeeCount} présent(s)
                            </Badge>
                          </div>
                        </div>

                        {session.participantsPresent.length > 0 && (
                          <div className="pl-6 space-y-1">
                            {session.participantsPresent.map((p, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                <span>{p.name}</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="text-muted-foreground">{p.book}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {session.notes && (
                          <p className="text-sm text-muted-foreground pl-6">
                            Note: {session.notes}
                          </p>
                        )}
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

export default ClassDetailDialog;
