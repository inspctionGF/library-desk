import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Send, Mail } from "lucide-react";
import { useLibraryStore } from "@/hooks/useLibraryStore";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { toast } from "@/hooks/use-toast";

interface FeedbackDialogProps {
  trigger?: React.ReactNode;
}

const feedbackTypes = [
  { value: "bug", label: "Bug / Problème", color: "destructive" },
  { value: "feature", label: "Suggestion de fonctionnalité", color: "primary" },
  { value: "improvement", label: "Amélioration", color: "secondary" },
  { value: "question", label: "Question", color: "muted" },
  { value: "other", label: "Autre", color: "accent" },
];

export function FeedbackDialog({ trigger }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addFeedback } = useLibraryStore();
  const { config } = useSystemConfig();

  const resetForm = () => {
    setType("");
    setSubject("");
    setMessage("");
  };

  const handleSubmit = (sendEmail: boolean = false) => {
    if (!type || !subject.trim() || !message.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const feedback = {
      type,
      subject: subject.trim(),
      message: message.trim(),
      cdejNumber: config?.cdejNumber || "N/A",
      churchName: config?.churchName || "N/A",
      status: (sendEmail ? "sent" : "pending") as "pending" | "sent" | "reviewed",
    };

    // Store locally
    addFeedback(feedback);

    if (sendEmail) {
      // Open mailto: link
      const typeLabel = feedbackTypes.find((t) => t.value === type)?.label || type;
      const emailSubject = encodeURIComponent(`[BiblioSystem Feedback] ${typeLabel}: ${subject}`);
      const emailBody = encodeURIComponent(
        `Type: ${typeLabel}\n` +
        `Sujet: ${subject}\n` +
        `CDEJ: ${feedback.cdejNumber}\n` +
        `Église: ${feedback.churchName}\n\n` +
        `Message:\n${message}\n\n` +
        `---\nEnvoyé depuis BiblioSystem`
      );
      
      window.open(`mailto:support@bibliosystem.app?subject=${emailSubject}&body=${emailBody}`, "_blank");
    }

    toast({
      title: sendEmail ? "Feedback envoyé" : "Feedback enregistré",
      description: sendEmail 
        ? "Votre client email s'est ouvert. Merci pour votre retour!"
        : "Votre feedback a été enregistré localement.",
    });

    resetForm();
    setOpen(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Envoyer un feedback
          </DialogTitle>
          <DialogDescription>
            Partagez vos idées, signalez un problème ou posez une question.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Type de feedback *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Sujet *</Label>
            <Input
              id="subject"
              placeholder="Résumé de votre feedback"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Décrivez votre feedback en détail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/1000
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Enregistrer
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Envoyer par email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
