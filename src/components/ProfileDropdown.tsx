import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Power, User, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

export function ProfileDropdown() {
  const navigate = useNavigate();
  const { isAdmin, isGuest, logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);

  const user = {
    name: isAdmin ? 'Administrateur' : 'Invité',
    email: isAdmin ? 'admin@bibliosystem.com' : '',
    role: isAdmin ? 'Administrateur' : 'Invité',
    avatarUrl: '',
  };

  const handleLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    window.location.href = '/login';
  };

  const handleQuit = () => {
    // Close the app/tab
    setQuitDialogOpen(false);
    window.close();
    // Fallback if window.close() doesn't work
    window.location.href = 'about:blank';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2 h-9 hover:bg-muted">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-foreground leading-none">
                {user.name}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-popover border border-border shadow-lg z-50">
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3 p-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground leading-none">
                  {user.name}
                </p>
                {user.email && (
                  <p className="text-xs text-muted-foreground leading-none">
                    {user.email}
                  </p>
                )}
                <Badge variant="outline" className="w-fit mt-1 text-[10px] px-1.5 py-0 bg-primary/5 text-primary border-primary/20">
                  {user.role}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAdmin && (
            <DropdownMenuItem
              onClick={() => navigate('/profile')}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <User className="mr-2 h-4 w-4" />
              Mon Profil
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setLogoutDialogOpen(true)}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Fermer Session
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem
              onClick={() => setQuitDialogOpen(true)}
              className="cursor-pointer text-destructive hover:text-destructive focus:text-destructive"
            >
              <Power className="mr-2 h-4 w-4" />
              Quitter l'application
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fermer la session ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à l'application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quit App Confirmation Dialog */}
      <AlertDialog open={quitDialogOpen} onOpenChange={setQuitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter l'application ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir quitter l'application ? Toutes les modifications non enregistrées seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleQuit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Quitter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}