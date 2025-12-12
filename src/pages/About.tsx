import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, Code, Globe, Mail, Sparkles, FileText, User, Linkedin, Github, HelpCircle, ChevronDown } from 'lucide-react';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import developerPhoto from '@/assets/developer-photo.png';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Technology icons as inline SVGs
const TechIcons = {
  react: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 01-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68 0 1.69-1.83 2.93-4.37 3.68.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68 0-1.69 1.83-2.93 4.37-3.68-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26m9 2.26l-.3.51c.31-.05.61-.1.88-.16-.07-.28-.18-.57-.29-.86l-.29.51m-2.89 4.04c1.59 1.5 2.97 2.08 3.59 1.7.64-.35.83-1.82.32-3.96-.77.16-1.58.28-2.4.36-.48.67-.99 1.31-1.51 1.9M8.08 9.74l.3-.51c-.31.05-.61.1-.88.16.07.28.18.57.29.86l.29-.51m2.89-4.04C9.38 4.2 8 3.62 7.37 4c-.63.35-.82 1.82-.31 3.96a22.7 22.7 0 012.4-.36c.48-.67.99-1.31 1.51-1.9z"/>
    </svg>
  ),
  typescript: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M3 3h18v18H3V3zm10.71 14.86c.5.98 1.51 1.73 3.09 1.73 1.6 0 2.8-.83 2.8-2.36 0-1.41-.81-2.04-2.25-2.66l-.42-.18c-.73-.31-1.04-.52-1.04-1.02 0-.41.31-.73.81-.73.48 0 .8.21 1.09.73l1.31-.87c-.55-.96-1.33-1.33-2.4-1.33-1.51 0-2.48.96-2.48 2.23 0 1.38.81 2.03 2.03 2.55l.42.18c.78.34 1.24.55 1.24 1.13 0 .48-.45.83-1.15.83-.83 0-1.31-.43-1.67-1.03l-1.38.8zM13 11.25H8v1.5h1.5V20h1.75v-7.25H13v-1.5z"/>
    </svg>
  ),
  tailwind: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/>
    </svg>
  ),
  vite: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="m8.286 10.578.512-8.657a.306.306 0 0 1 .247-.282L17.377.006a.306.306 0 0 1 .353.385l-1.558 5.403a.306.306 0 0 0 .352.385l2.388-.46a.306.306 0 0 1 .332.438l-6.79 13.55-.123.19a.294.294 0 0 1-.252.14c-.177 0-.35-.152-.305-.369l1.095-5.301a.306.306 0 0 0-.388-.355l-1.433.435a.306.306 0 0 1-.389-.354l.69-3.375a.306.306 0 0 0-.37-.36l-2.32.536a.306.306 0 0 1-.374-.316zm14.976-7.926L17.284 3.74l-.544 1.887 2.077-.4a.8.8 0 0 1 .84.369.8.8 0 0 1 .034.783L12.9 19.93l-.013.025-.015.023-.122.19a.801.801 0 0 1-.672.37.826.826 0 0 1-.634-.302.8.8 0 0 1-.16-.67l1.029-4.981-1.12.34a.81.81 0 0 1-.86-.262.802.802 0 0 1-.165-.67l.63-3.08-2.027.468a.808.808 0 0 1-.768-.233.81.81 0 0 1-.217-.6l.389-6.57-7.44-1.33a.612.612 0 0 0-.64.906L11.58 23.691a.612.612 0 0 0 1.066-.004l11.26-20.135a.612.612 0 0 0-.644-.9z"/>
    </svg>
  ),
  shadcn: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3L3 21h18L12 3z"/>
    </svg>
  ),
  lucide: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  ),
  hookform: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  recharts: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
    </svg>
  ),
};

const faqItems = [
  {
    question: "Comment ajouter un nouveau livre au catalogue ?",
    answer: "Accédez à la page 'Livres' depuis le menu, puis cliquez sur le bouton 'Ajouter un livre'. Remplissez les informations requises (titre, auteur, ISBN, catégorie, quantité) et validez. Vous pouvez également importer plusieurs livres via un fichier CSV."
  },
  {
    question: "Comment créer un prêt pour un participant ?",
    answer: "Sur la page 'Prêts', cliquez sur 'Nouveau prêt'. Sélectionnez le type d'emprunteur (participant ou autre lecteur), choisissez le livre disponible et définissez la date de retour prévue. Le système vérifie automatiquement la limite de 3 prêts actifs par emprunteur."
  },
  {
    question: "Comment enregistrer une session de lecture collective ?",
    answer: "Dans 'Sessions de lecture', choisissez l'onglet 'Sessions collectives' puis 'Nouvelle session'. Vous pouvez enregistrer en mode rapide (classe + nombre de présents) ou en mode détaillé (sélection individuelle des participants et des livres lus)."
  },
  {
    question: "Comment générer une fiche de résumé pour un livre ?",
    answer: "Sur la page 'Résumés', cliquez sur 'Générer une fiche'. Sélectionnez le participant et le livre concerné. La fiche générée contient un QR code unique et peut être imprimée pour que le participant y rédige son résumé."
  },
  {
    question: "Comment signaler un livre endommagé ou perdu ?",
    answer: "Accédez à 'Problèmes de livres' et cliquez sur 'Signaler un problème'. Sélectionnez le livre, le type de problème (non retourné, endommagé, déchiré, perdu), la quantité affectée et ajoutez des notes explicatives. Ces signalements facilitent les audits."
  },
  {
    question: "Comment effectuer un inventaire du stock ?",
    answer: "Dans 'Inventaire', démarrez une nouvelle session d'inventaire. Le système liste tous les livres du catalogue. Pour chaque livre, entrez la quantité physique trouvée. Les écarts sont automatiquement identifiés et peuvent être signalés comme problèmes."
  },
  {
    question: "Comment sauvegarder les données de l'application ?",
    answer: "Dans la barre latérale, la section 'Base de données' affiche la taille estimée des données. Cliquez sur 'Exporter' pour télécharger un fichier JSON contenant toutes vos données. Conservez ce fichier en lieu sûr pour pouvoir restaurer vos données si nécessaire."
  },
  {
    question: "Comment transférer des participants vers une nouvelle classe ?",
    answer: "Sur la page 'Participants', utilisez le bouton 'Transfert de classe'. Le système détecte automatiquement les participants dont l'âge ne correspond plus à leur classe actuelle et propose de les réassigner vers des classes appropriées."
  },
];

const updates = [
  {
    version: '1.2.0',
    date: '2024-12-01',
    title: 'Gestion des problèmes de livres',
    changes: [
      'Suivi des livres non retournés, endommagés et perdus',
      'Signalement rapide depuis les prêts en retard',
      'Indicateurs de problèmes sur la page des livres',
    ],
  },
  {
    version: '1.1.0',
    date: '2024-11-15',
    title: 'Module Matériels',
    changes: [
      'Gestion des matériels (jeux, équipements, mobilier)',
      'Prêts de matériels aux participants et entités',
      'Types de matériels personnalisables',
    ],
  },
  {
    version: '1.0.0',
    date: '2024-10-01',
    title: 'Version initiale',
    changes: [
      'Gestion complète du catalogue de livres',
      'Système de prêts avec suivi des retards',
      'Gestion des classes et participants',
      'Sessions de lecture individuelles et collectives',
      'Fiches de résumé imprimables',
      'Tableau de bord avec statistiques',
    ],
  },
];

export default function About() {
  const { config } = useSystemConfig();
  const cdejNumber = config?.cdejNumber ? `HA-${config.cdejNumber}` : '[CDEJ]';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground">À propos de BiblioSystem</h1>
            <p className="text-muted-foreground mt-1">
              Informations sur l'application, le développeur et la licence
            </p>
          </div>
          <Badge variant="secondary" className="self-start text-sm px-3 py-1">
            v{updates[0].version}
          </Badge>
        </div>

        {/* Technologies utilisées */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Code className="h-4 w-4 text-primary" />
              Technologies utilisées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-[hsl(197,71%,52%)]/10 text-[hsl(197,71%,42%)] border-[hsl(197,71%,52%)]/30 gap-1.5">
                {TechIcons.react}
                React
              </Badge>
              <Badge variant="outline" className="bg-[hsl(211,60%,48%)]/10 text-[hsl(211,60%,48%)] border-[hsl(211,60%,48%)]/30 gap-1.5">
                {TechIcons.typescript}
                TypeScript
              </Badge>
              <Badge variant="outline" className="bg-[hsl(198,93%,60%)]/10 text-[hsl(198,80%,40%)] border-[hsl(198,93%,60%)]/30 gap-1.5">
                {TechIcons.tailwind}
                Tailwind CSS
              </Badge>
              <Badge variant="outline" className="bg-[hsl(260,60%,50%)]/10 text-[hsl(260,60%,50%)] border-[hsl(260,60%,50%)]/30 gap-1.5">
                {TechIcons.vite}
                Vite
              </Badge>
              <Badge variant="outline" className="bg-foreground/5 text-foreground border-foreground/20 gap-1.5">
                {TechIcons.shadcn}
                shadcn/ui
              </Badge>
              <Badge variant="outline" className="bg-[hsl(142,71%,45%)]/10 text-[hsl(142,71%,45%)] border-[hsl(142,71%,45%)]/30 gap-1.5">
                {TechIcons.lucide}
                Lucide Icons
              </Badge>
              <Badge variant="outline" className="bg-[hsl(348,83%,47%)]/10 text-[hsl(348,83%,47%)] border-[hsl(348,83%,47%)]/30 gap-1.5">
                {TechIcons.hookform}
                React Hook Form
              </Badge>
              <Badge variant="outline" className="bg-[hsl(270,60%,50%)]/10 text-[hsl(270,60%,50%)] border-[hsl(270,60%,50%)]/30 gap-1.5">
                {TechIcons.recharts}
                Recharts
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-4 w-4 text-primary" />
              Questions fréquentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-sm hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Tabs defaultValue="updates" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="updates" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Mises à jour</span>
            </TabsTrigger>
            <TabsTrigger value="developer" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Développeur</span>
            </TabsTrigger>
            <TabsTrigger value="license" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Licence</span>
            </TabsTrigger>
          </TabsList>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Historique des mises à jour
                </CardTitle>
                <CardDescription>
                  Découvrez les nouvelles fonctionnalités et améliorations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {updates.map((update, index) => (
                  <div key={update.version}>
                    <div className="flex items-start gap-4">
                      <Badge variant="outline" className="mt-0.5 shrink-0">
                        v{update.version}
                      </Badge>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(update.date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <h4 className="font-semibold">{update.title}</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {update.changes.map((change, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary mt-1.5">•</span>
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {index < updates.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Developer Tab */}
          <TabsContent value="developer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  À propos du développeur
                </CardTitle>
                <CardDescription>
                  L'équipe derrière BiblioSystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Avatar className="h-32 w-32 border-4 border-primary/20 overflow-hidden">
                    <AvatarImage 
                      src={developerPhoto} 
                      alt="Jean Kemy MOROSE" 
                      className="object-cover object-top scale-150 translate-y-4"
                    />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      JKM
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold">Jean Kemy MOROSE</h3>
                      <p className="text-muted-foreground">Ingénieur en Informatique • Développeur Logiciel</p>
                      <p className="text-xs text-muted-foreground">Ex-Moniteur du CDEJ HA-0832 • CEO d'EXTENDED</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      BIBLIOSYSTEM est une solution de base de données robuste, initialement développée en Java puis modernisée 
                      avec des technologies web de pointe. Elle est conçue pour améliorer considérablement la gestion et 
                      l'efficacité opérationnelle des Centres de Documentation à travers tout réseau CDEJ.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Construite pour la flexibilité, la scalabilité et la performance, BIBLIOSYSTEM offre une approche 
                      moderne pour organiser, accéder et maintenir les ressources documentaires, garantissant à chaque 
                      centre CDEJ un système rationalisé, fiable et professionnel.
                    </p>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">Supervisée par :</p>
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Ilener DIEUJUSTE</strong>, Ex-Responsable du 
                        Centre de Documentation du CDEJ HA-0832.
                      </p>
                    </div>
                    <Separator />
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">bibliosystem.tech@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">EXTENDED - Haïti</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">React • TypeScript • Tailwind CSS</span>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://linkedin.com/in/jeankemymorose" target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://github.com/jeankemymorose" target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            GitHub
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* License Tab */}
          <TabsContent value="license" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Contrat de licence d'utilisation
                </CardTitle>
                <CardDescription>
                  Termes et conditions d'utilisation de BiblioSystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] rounded-md border p-4">
                  <div className="space-y-6 text-sm text-muted-foreground">
                    <section className="text-center pb-4 border-b">
                      <h2 className="text-lg font-bold text-foreground mb-2">
                        CONTRAT DE LICENCE D'UTILISATION DE L'APPLICATION BIBLIOSYSTEM
                      </h2>
                      <p className="text-xs">
                        Ce contrat de licence est conclu entre <strong className="text-foreground">EXTENDED</strong>, 
                        une firme de développement basée en Haïti, représentée par son CEO, 
                        <strong className="text-foreground"> Ing. Jean Kemy MOROSE</strong> identifié au CIN : 1472818125
                      </p>
                      <p className="text-xs mt-2">Et</p>
                      <p className="text-xs">
                        Les utilisateurs finaux (<strong className="text-foreground">{cdejNumber}</strong>) pour l'utilisation 
                        de l'application BiblioSystem développée par EXTENDED.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">1. LICENCE</h3>
                      <p>
                        Sous réserve des conditions énoncées dans le présent Contrat, EXTENDED accorde au client 
                        une licence limitée, non exclusive et non transférable d'utiliser BiblioSystem pour une 
                        utilisation interne uniquement.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">2. PRIX</h3>
                      <p>
                        Le Client accepte de payer la somme totale de <strong className="text-foreground">35,000 Gourdes</strong> pour 
                        l'utilisation de BiblioSystem.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">3. DROITS DE PROPRIÉTÉ INTELLECTUELLE</h3>
                      <p>
                        BiblioSystem, y compris tous les droits de propriété intellectuelle y afférents, est et 
                        restera la propriété d'EXTENDED. Le Client ne doit pas tenter de copier, modifier, 
                        distribuer ou vendre BiblioSystem sans le consentement écrit préalable d'EXTENDED.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">4. GARANTIE</h3>
                      <p>
                        Nous certifions que BiblioSystem a été installée avec succès chez quatre CDEJ et a été 
                        optimisée en conséquence pour offrir une expérience utilisateur fluide. Cependant, nous 
                        ne pouvons pas garantir que BiblioSystem sera exempte d'erreurs ou que son fonctionnement 
                        sera ininterrompu.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">5. ASSISTANCE TECHNIQUE</h3>
                      <p>
                        Nous offrons une assistance technique gratuite pendant un mois pour aider le client à 
                        maîtriser BiblioSystem et résoudre tout problème lié à l'utilisation de ladite application. 
                        Cette assistance technique est limitée à une période d'un mois et ne couvre pas les problèmes 
                        causés par une mauvaise utilisation de l'application ou par des modifications apportées par le client.
                      </p>
                      <p className="mt-2">
                        Il est important de noter que toute mauvaise utilisation de l'application après le mois de 
                        support technique est sous la responsabilité du client. Nous ne sommes pas responsables des 
                        problèmes résultant d'une mauvaise utilisation de l'application ou d'une modification apportée 
                        par le client.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">6. LIMITATION DE RESPONSABILITÉ</h3>
                      <p>
                        En aucun cas EXTENDED ne sera responsable des dommages directs, indirects, spéciaux ou 
                        consécutifs découlant de l'utilisation ou de l'incapacité d'utiliser BiblioSystem après formation.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">7. DURÉE ET RÉSILIATION</h3>
                      <p>
                        Le présent Contrat entrera en vigueur à compter de la date d'acceptation par le Client et 
                        se poursuivra jusqu'à sa résiliation par l'une ou l'autre des parties. Le Client peut 
                        résilier le présent Contrat à tout moment en cessant d'utiliser BiblioSystem.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">8. PROPRIÉTÉ ET INTERDICTION DE COPIE</h3>
                      <p>
                        Le Client reconnaît que l'Application est la propriété exclusive d'EXTENDED. Le client 
                        s'engage à ne pas copier, reproduire, modifier, distribuer ou vendre BiblioSystem sans 
                        le consentement écrit préalable d'EXTENDED.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">9. SAUVEGARDE DES DONNÉES</h3>
                      <p>
                        Le Client est responsable de sauvegarder ses propres données. EXTENDED ne sera pas 
                        responsable de la perte de données en raison d'une réinitialisation ou d'un autre 
                        problème technique. Le Client doit prendre les mesures nécessaires pour sauvegarder 
                        ses données avant toute réinitialisation ou mise à jour de l'Application.
                      </p>
                    </section>

                    <section className="pt-4 border-t">
                      <p className="text-xs">
                        En acceptant ce contrat, le Client reconnaît qu'il a lu et compris les termes et 
                        conditions énoncés dans ce document et qu'il accepte d'être lié par ces termes et conditions.
                      </p>
                    </section>

                    <section className="pt-4 border-t text-center">
                      <p className="font-semibold text-foreground">Jean Kemy MOROSE</p>
                      <p className="text-xs">CEO, EXTENDED</p>
                      <p className="text-xs">Développeur BiblioSystem</p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
