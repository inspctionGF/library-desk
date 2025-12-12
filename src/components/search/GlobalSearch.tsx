import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  Users, 
  GraduationCap, 
  CheckSquare, 
  BookOpen, 
  Wrench, 
  UserCircle,
  Plus,
  Settings,
  BarChart3,
  Search
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';

const typeConfig = {
  book: { icon: Book, label: 'Livres', color: 'text-blue-500' },
  participant: { icon: Users, label: 'Participants', color: 'text-green-500' },
  class: { icon: GraduationCap, label: 'Classes', color: 'text-purple-500' },
  task: { icon: CheckSquare, label: 'Tâches', color: 'text-orange-500' },
  loan: { icon: BookOpen, label: 'Prêts', color: 'text-teal-500' },
  material: { icon: Wrench, label: 'Matériels', color: 'text-rose-500' },
  otherReader: { icon: UserCircle, label: 'Autres Lecteurs', color: 'text-indigo-500' },
};

const quickActions = [
  { id: 'new-book', label: 'Nouveau livre', icon: Plus, url: '/books', action: 'add-book' },
  { id: 'new-loan', label: 'Nouveau prêt', icon: Plus, url: '/loans', action: 'add-loan' },
  { id: 'new-participant', label: 'Nouveau participant', icon: Plus, url: '/participants', action: 'add-participant' },
  { id: 'reports', label: 'Voir les rapports', icon: BarChart3, url: '/reports' },
  { id: 'settings', label: 'Paramètres', icon: Settings, url: '/settings' },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { results, totalResults } = useGlobalSearch(query);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    navigate(result.url);
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    setOpen(false);
    setQuery('');
    navigate(action.url);
  };

  const renderResultGroup = (type: keyof typeof typeConfig, items: SearchResult[]) => {
    if (items.length === 0) return null;
    const config = typeConfig[type];
    const Icon = config.icon;

    return (
      <CommandGroup heading={config.label} key={type}>
        {items.map((item) => (
          <CommandItem
            key={item.id}
            value={`${type}-${item.id}`}
            onSelect={() => handleSelect(item)}
            className="cursor-pointer"
          >
            <Icon className={`mr-2 h-4 w-4 ${config.color}`} />
            <div className="flex flex-col">
              <span>{item.title}</span>
              {item.subtitle && (
                <span className="text-xs text-muted-foreground">{item.subtitle}</span>
              )}
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    );
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="relative h-9 w-9 p-0 xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Rechercher...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Rechercher partout..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          
          {query.length < 2 && (
            <CommandGroup heading="Actions Rapides">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.id}
                  value={action.id}
                  onSelect={() => handleQuickAction(action)}
                  className="cursor-pointer"
                >
                  <action.icon className="mr-2 h-4 w-4 text-primary" />
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.length >= 2 && totalResults > 0 && (
            <>
              {renderResultGroup('book', results.books)}
              {renderResultGroup('participant', results.participants)}
              {renderResultGroup('class', results.classes)}
              {renderResultGroup('task', results.tasks)}
              {renderResultGroup('loan', results.loans)}
              {renderResultGroup('material', results.materials)}
              {renderResultGroup('otherReader', results.otherReaders)}
              
              <CommandSeparator />
              
              <CommandGroup heading="Actions Rapides">
                {quickActions.slice(0, 3).map((action) => (
                  <CommandItem
                    key={action.id}
                    value={action.id}
                    onSelect={() => handleQuickAction(action)}
                    className="cursor-pointer"
                  >
                    <action.icon className="mr-2 h-4 w-4 text-primary" />
                    <span>{action.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
