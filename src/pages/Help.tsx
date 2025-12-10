import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Library, Settings, HelpCircle, Construction } from 'lucide-react';

export default function Help() {
  const sections = [
    {
      icon: BookOpen,
      title: 'Gestion des livres',
      description: 'Ajouter, modifier et organiser votre catalogue de livres.',
    },
    {
      icon: Users,
      title: 'Participants et Classes',
      description: 'Gérer les participants et leurs classes respectives.',
    },
    {
      icon: Library,
      title: 'Sessions de lecture',
      description: 'Suivre les sessions de lecture individuelles et de classe.',
    },
    {
      icon: Settings,
      title: 'Paramètres',
      description: 'Configurer le système selon vos besoins.',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centre d'aide</h1>
          <p className="text-muted-foreground">
            Guide complet pour utiliser BiblioSystem
          </p>
        </div>

        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Construction className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Guide en cours de développement</h2>
            <p className="text-muted-foreground max-w-md">
              Le tutoriel complet sera bientôt disponible. En attendant, voici un aperçu des sections qui seront couvertes.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title} className="opacity-60">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="rounded-lg bg-muted p-2">
                  <section.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}