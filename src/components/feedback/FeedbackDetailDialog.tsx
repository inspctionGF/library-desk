import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Feedback {
  id: string;
  type: string;
  subject: string;
  message: string;
  cdejNumber: string;
  churchName: string;
  status: string;
  createdAt: string;
}

interface FeedbackDetailDialogProps {
  feedback: Feedback | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const feedbackTypeLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  bug: { label: "Bug", variant: "destructive" },
  feature: { label: "Suggestion", variant: "default" },
  improvement: { label: "Amélioration", variant: "secondary" },
  question: { label: "Question", variant: "outline" },
  other: { label: "Autre", variant: "outline" },
};

export function FeedbackDetailDialog({
  feedback,
  open,
  onOpenChange,
}: FeedbackDetailDialogProps) {
  if (!feedback) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant={feedbackTypeLabels[feedback.type]?.variant || "outline"}
            >
              {feedbackTypeLabels[feedback.type]?.label || feedback.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(feedback.createdAt), "dd MMMM yyyy à HH:mm", {
                locale: fr,
              })}
            </span>
          </div>
          <DialogTitle>{feedback.subject}</DialogTitle>
          <DialogDescription>
            CDEJ: {feedback.cdejNumber} • {feedback.churchName}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-sm whitespace-pre-wrap">{feedback.message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
