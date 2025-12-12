import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { ChevronRight, Home } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/notifications/NotificationBell';
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
  '/notifications': 'Notifications',
};

// New component that only contains the content wrapper (no SidebarProvider)
export function AdminLayoutContent({ children }: AdminLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentLabel = routeLabels[currentPath] || 'Page';
  const isHome = currentPath === '/';

  return (
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
          <NotificationBell />
        </div>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </SidebarInset>
  );
}

// Legacy export for backwards compatibility (wraps with SidebarProvider)
export function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}