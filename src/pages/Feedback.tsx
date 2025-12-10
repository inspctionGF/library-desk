import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useLibraryStore } from "@/hooks/useLibraryStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Mail,
  Eye,
  CheckCircle,
  Clock,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { FeedbackDetailDialog } from "@/components/feedback/FeedbackDetailDialog";
import { toast } from "@/hooks/use-toast";

const feedbackTypeLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  bug: { label: "Bug", variant: "destructive" },
  feature: { label: "Suggestion", variant: "default" },
  improvement: { label: "Amélioration", variant: "secondary" },
  question: { label: "Question", variant: "outline" },
  other: { label: "Autre", variant: "outline" },
};

const statusLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "En attente", icon: <Clock className="h-3 w-3" />, color: "text-muted-foreground" },
  sent: { label: "Envoyé", icon: <Send className="h-3 w-3" />, color: "text-primary" },
  reviewed: { label: "Traité", icon: <CheckCircle className="h-3 w-3" />, color: "text-green-600" },
};

export default function Feedback() {
  const { feedbacks, deleteFeedback, updateFeedback } = useLibraryStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewFeedback, setViewFeedback] = useState<typeof feedbacks[0] | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteFeedback(deleteId);
      toast({
        title: "Feedback supprimé",
        description: "Le feedback a été supprimé avec succès.",
      });
      setDeleteId(null);
    }
  };

  const handleMarkAsReviewed = (id: string) => {
    updateFeedback(id, { status: "reviewed" });
    toast({
      title: "Statut mis à jour",
      description: "Le feedback a été marqué comme traité.",
    });
  };

  const handleResendEmail = (feedback: typeof feedbacks[0]) => {
    const typeLabel = feedbackTypeLabels[feedback.type]?.label || feedback.type;
    const emailSubject = encodeURIComponent(`[BiblioSystem Feedback] ${typeLabel}: ${feedback.subject}`);
    const emailBody = encodeURIComponent(
      `Type: ${typeLabel}\n` +
      `Sujet: ${feedback.subject}\n` +
      `CDEJ: ${feedback.cdejNumber}\n` +
      `Église: ${feedback.churchName}\n\n` +
      `Message:\n${feedback.message}\n\n` +
      `---\nEnvoyé depuis BiblioSystem`
    );
    
    window.open(`mailto:support@bibliosystem.app?subject=${emailSubject}&body=${emailBody}`, "_blank");
    updateFeedback(feedback.id, { status: "sent" });
  };

  const sortedFeedbacks = [...feedbacks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
            <p className="text-muted-foreground">
              Gérez vos retours et suggestions
            </p>
          </div>
          <FeedbackDialog
            trigger={
              <Button className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Nouveau feedback
              </Button>
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-2xl">{feedbacks.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En attente</CardDescription>
              <CardTitle className="text-2xl">
                {feedbacks.filter((f) => f.status === "pending").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Envoyés</CardDescription>
              <CardTitle className="text-2xl">
                {feedbacks.filter((f) => f.status === "sent").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des feedbacks</CardTitle>
            <CardDescription>
              Tous vos feedbacks enregistrés et envoyés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedFeedbacks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun feedback enregistré</p>
                <p className="text-sm">
                  Cliquez sur "Nouveau feedback" pour partager vos idées
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(feedback.createdAt), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            feedbackTypeLabels[feedback.type]?.variant || "outline"
                          }
                        >
                          {feedbackTypeLabels[feedback.type]?.label || feedback.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[300px] truncate">
                        {feedback.subject}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1.5 ${
                            statusLabels[feedback.status]?.color
                          }`}
                        >
                          {statusLabels[feedback.status]?.icon}
                          <span className="text-sm">
                            {statusLabels[feedback.status]?.label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setViewFeedback(feedback)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResendEmail(feedback)}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Envoyer par email
                            </DropdownMenuItem>
                            {feedback.status !== "reviewed" && (
                              <DropdownMenuItem
                                onClick={() => handleMarkAsReviewed(feedback.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marquer comme traité
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(feedback.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le feedback sera définitivement
              supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FeedbackDetailDialog
        feedback={viewFeedback}
        open={!!viewFeedback}
        onOpenChange={() => setViewFeedback(null)}
      />
    </AdminLayout>
  );
}
