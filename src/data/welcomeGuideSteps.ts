import { 
  BookOpen, 
  Library, 
  Users, 
  CalendarClock, 
  BarChart3, 
  Sparkles,
  LucideIcon 
} from 'lucide-react';

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const welcomeGuideSteps: GuideStep[] = [
  {
    id: 'welcome',
    title: "Bienvenue sur BiblioSystem!",
    description: "Votre nouveau système de gestion de centre de documentation. Ce guide vous aidera à découvrir les fonctionnalités principales.",
    icon: BookOpen,
  },
  {
    id: 'books',
    title: "Gérez vos livres",
    description: "Ajoutez des livres à votre catalogue, organisez-les par catégories et suivez la disponibilité de chaque exemplaire en temps réel.",
    icon: Library,
  },
  {
    id: 'participants',
    title: "Inscrivez vos participants",
    description: "Créez des classes selon les tranches d'âge et inscrivez les enfants. Chaque participant reçoit un numéro unique pour le suivi.",
    icon: Users,
  },
  {
    id: 'loans',
    title: "Suivez les emprunts",
    description: "Prêtez des livres aux participants et autres lecteurs. Recevez des alertes pour les retards et gérez les retours facilement.",
    icon: CalendarClock,
  },
  {
    id: 'reports',
    title: "Analysez vos données",
    description: "Consultez les rapports détaillés pour évaluer l'activité de votre centre et préparer les audits nationaux.",
    icon: BarChart3,
  },
  {
    id: 'ready',
    title: "Vous êtes prêt!",
    description: "Explorez BiblioSystem et commencez à gérer votre centre de documentation dès maintenant.",
    icon: Sparkles,
  },
];
