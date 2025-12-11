import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, Code, Globe, Mail, Sparkles, FileText, User } from 'lucide-react';

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
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src="/placeholder.svg" alt="Developer" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      DEV
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold">[Nom du développeur]</h3>
                      <p className="text-muted-foreground">Développeur BiblioSystem</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      BiblioSystem a été conçu pour aider les centres de documentation des jeunes (CDEJ) 
                      à gérer efficacement leurs ressources littéraires. Cette application facilite le suivi 
                      des livres, des prêts et des sessions de lecture, tout en offrant une interface 
                      conviviale adaptée aux besoins des bibliothécaires et des lecteurs.
                    </p>
                    <Separator />
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">contact@example.com</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">www.example.com</span>
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
                  Accord de licence
                </CardTitle>
                <CardDescription>
                  Termes et conditions d'utilisation de BiblioSystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] rounded-md border p-4">
                  <div className="space-y-6 text-sm text-muted-foreground">
                    <section>
                      <h3 className="font-semibold text-foreground mb-2">1. ACCEPTATION DES TERMES</h3>
                      <p>
                        En utilisant BiblioSystem, vous acceptez d'être lié par les présents termes et conditions. 
                        Si vous n'acceptez pas ces termes, veuillez ne pas utiliser cette application.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">2. LICENCE D'UTILISATION</h3>
                      <p>
                        Une licence non exclusive et non transférable vous est accordée pour utiliser BiblioSystem 
                        aux fins de gestion de votre centre de documentation. Cette licence est valide pour la durée 
                        de votre abonnement ou accord de licence.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">3. RESTRICTIONS</h3>
                      <p>Vous vous engagez à ne pas :</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Copier, modifier ou distribuer le logiciel sans autorisation</li>
                        <li>Utiliser le logiciel à des fins illégales</li>
                        <li>Tenter de désassembler ou de rétro-ingéniérie le code source</li>
                        <li>Supprimer les notices de droits d'auteur</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">4. PROPRIÉTÉ INTELLECTUELLE</h3>
                      <p>
                        BiblioSystem et tous ses composants sont protégés par les lois sur la propriété 
                        intellectuelle. Le développeur conserve tous les droits de propriété sur le logiciel.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">5. LIMITATION DE RESPONSABILITÉ</h3>
                      <p>
                        Le logiciel est fourni "tel quel" sans garantie d'aucune sorte. Le développeur ne 
                        peut être tenu responsable des dommages directs, indirects ou consécutifs résultant 
                        de l'utilisation du logiciel.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">6. DONNÉES ET CONFIDENTIALITÉ</h3>
                      <p>
                        Vos données sont stockées localement sur votre appareil. Le développeur s'engage à 
                        respecter la confidentialité de vos informations et à ne pas collecter de données 
                        personnelles sans votre consentement.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">7. MISES À JOUR</h3>
                      <p>
                        Le développeur peut fournir des mises à jour du logiciel de temps à autre. Ces mises 
                        à jour sont soumises aux présents termes de licence.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">8. RÉSILIATION</h3>
                      <p>
                        Cette licence prend fin automatiquement si vous ne respectez pas les termes et 
                        conditions. En cas de résiliation, vous devez cesser toute utilisation du logiciel.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-foreground mb-2">9. LOI APPLICABLE</h3>
                      <p>
                        Cette licence est régie par les lois en vigueur dans le pays où le logiciel est utilisé.
                      </p>
                    </section>

                    <section className="pt-4 border-t">
                      <p className="text-xs">
                        <strong className="text-foreground">Note :</strong> Ce texte est un exemple générique. 
                        Le texte définitif de la licence sera fourni ultérieurement.
                      </p>
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
