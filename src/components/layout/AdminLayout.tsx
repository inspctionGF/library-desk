import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { Bell, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface AdminLayoutProps {
  children: ReactNode;
}

const routeLabels: Record<string, string> = {
  '/': 'Tableau de bord',
  '/books': 'Livres',
  '/categories': 'Catégories',
  '/tasks': 'Tâches',
  '/classes': 'Classes',
  '/participants': 'Participants',
  '/loans': 'Prêts',
  '/reports': 'Rapports',
  '/settings': 'Paramètres',
  '/profile': 'Mon Profil',
  '/profiles': 'Profils',
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentLabel = routeLabels[currentPath] || 'Page';
  const isHome = currentPath === '/';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    {isHome ? (
                      <BreadcrumbPage className="flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5" />
                        <span>Tableau de bord</span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to="/" className="flex items-center gap-1.5">
                          <Home className="h-3.5 w-3.5" />
                          <span>Accueil</span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isHome && (
                    <>
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </BreadcrumbSeparator>
                      <BreadcrumbItem>
                        <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}