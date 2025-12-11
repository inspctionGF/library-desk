import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, Code, Globe, Mail, Sparkles, FileText, User } from 'lucide-react';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import developerPhoto from '@/assets/developer-photo.png';

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">À propos de BiblioSystem</h1>
          <p className="text-muted-foreground mt-1">
            Informations sur l'application, le développeur et la licence
          </p>
        </div>

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
                      <p className="text-muted-foreground">Ingénieur en Informatique • Programmeur</p>
                      <p className="text-xs text-muted-foreground">Ex-Moniteur du CDEJ HA-0832 & CEO d'EXTENDED</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      BIBLIOSYSTEM est une base de données développée premièrement en JAVA mais adaptée 
                      en technologies web modernes. Elle a été conçue pour améliorer la gestion des 
                      CENTRES DE DOCUMENTATION de n'importe quel CDEJ.
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
                        <strong className="text-foreground"> Ing. Jean Kemy MOROSE</strong> identifié au CIN : 1572818125
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
