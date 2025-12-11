import { BookOpen, LayoutDashboard, FolderOpen, Users, GraduationCap, BookCopy, BarChart3, Settings, Library, Search, HelpCircle, MessageSquare, Database, CheckSquare, UserCog, KeyRound, CalendarDays, BookOpenCheck, Package, ClipboardCheck, UserPlus, BookX, Info } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Input } from '@/components/ui/input';
import { useLibraryStore } from '@/hooks/useLibraryStore';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const mainNavItems = [
  { title: 'Tableau de bord', url: '/', icon: LayoutDashboard },
  { title: 'Livres', url: '/books', icon: BookOpen },
  { title: 'Catégories', url: '/categories', icon: FolderOpen },
  { title: 'Fiches de résumé', url: '/book-resumes', icon: Library },
  { title: 'Tâches', url: '/tasks', icon: CheckSquare },
  { title: 'Activités Extra', url: '/extra-activities', icon: CalendarDays },
];

const managementItems = [
  { title: 'Classes', url: '/classes', icon: GraduationCap },
  { title: 'Participants', url: '/participants', icon: Users },
  { title: 'Autres Lecteurs', url: '/other-readers', icon: UserPlus },
  { title: 'Sessions de lecture', url: '/reading-sessions', icon: BookOpenCheck },
  { title: 'Prêts', url: '/loans', icon: BookCopy },
  { title: 'Livres non retournés', url: '/book-issues', icon: BookX },
  { title: 'Matériels', url: '/materials', icon: Package },
  { title: 'Inventaire', url: '/inventory', icon: ClipboardCheck },
];

const workspaceItems = [
  { title: 'PINs Invités', url: '/guest-pins', icon: KeyRound },
  { title: 'Profils', url: '/profiles', icon: UserCog },
  { title: 'Rapports', url: '/reports', icon: BarChart3 },
  { title: 'Paramètres', url: '/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const NavItem = ({ item, end = false }: { item: typeof mainNavItems[0]; end?: boolean }) => {
    const content = (
      <NavLink 
        to={item.url} 
        end={end} 
        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} rounded-lg ${isCollapsed ? 'p-2.5' : 'px-3 py-2'} text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
        activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
      >
        <item.icon className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'} shrink-0`} />
        {!isCollapsed && <span>{item.title}</span>}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className={`${isCollapsed ? 'p-3 flex justify-center' : 'p-4 pb-2'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Library className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">BiblioSystem</span>
              <span className="text-xs text-muted-foreground">Library Manager</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {!isCollapsed && (
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search" 
              className="h-9 pl-8 bg-secondary border-0 text-sm"
            />
          </div>
        </div>
      )}

      <SidebarContent className={isCollapsed ? 'px-2 py-2' : 'px-2'}>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-2">
              Main Menu
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={isCollapsed ? 'gap-1' : ''}>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title} className={isCollapsed ? 'flex justify-center' : ''}>
                  <SidebarMenuButton asChild className={isCollapsed ? 'w-auto' : ''}>
                    <NavItem item={item} end={item.url === '/'} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isCollapsed && <div className="my-2 mx-2 border-t border-sidebar-border" />}

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-2">
              Management
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={isCollapsed ? 'gap-1' : ''}>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title} className={isCollapsed ? 'flex justify-center' : ''}>
                  <SidebarMenuButton asChild className={isCollapsed ? 'w-auto' : ''}>
                    <NavItem item={item} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isCollapsed && <div className="my-2 mx-2 border-t border-sidebar-border" />}

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-2">
              Workspace
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={isCollapsed ? 'gap-1' : ''}>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.title} className={isCollapsed ? 'flex justify-center' : ''}>
                  <SidebarMenuButton asChild className={isCollapsed ? 'w-auto' : ''}>
                    <NavItem item={item} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={isCollapsed ? 'p-2' : 'p-3 space-y-1'}>
        <FooterLinks isCollapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}

function FooterLinks({ isCollapsed }: { isCollapsed: boolean }) {
  const { getDataStats } = useLibraryStore();
  const stats = getDataStats();

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <NavLink to="/help" className="flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <HelpCircle className="h-5 w-5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Centre d'aide</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <NavLink to="/feedback" className="flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <MessageSquare className="h-5 w-5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Feedback</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <NavLink to="/about" className="flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <Info className="h-5 w-5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">À propos</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center rounded-lg p-2.5 text-muted-foreground">
              <Database className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">💾 {stats.sizeInKB} KB</TooltipContent>
        </Tooltip>
        <div className="border-t border-sidebar-border w-full my-1" />
        <ProfileDropdown isCollapsed={true} />
      </div>
    );
  }

  return (
    <>
      <NavLink to="/help" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <HelpCircle className="h-4 w-4" />
        <span>Centre d'aide</span>
      </NavLink>
      <NavLink to="/feedback" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>Feedback</span>
      </NavLink>
      <NavLink to="/about" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Info className="h-4 w-4" />
        <span>À propos</span>
      </NavLink>
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
        <Database className="h-3.5 w-3.5" />
        <span>💾 {stats.sizeInKB} KB</span>
      </div>
      <div className="border-t border-sidebar-border my-2" />
      <ProfileDropdown isCollapsed={false} />
    </>
  );
}