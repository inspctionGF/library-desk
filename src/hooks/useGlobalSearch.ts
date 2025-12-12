import { useMemo } from 'react';
import { useLibraryStore } from './useLibraryStore';

export interface SearchResult {
  id: string;
  type: 'book' | 'participant' | 'class' | 'task' | 'loan' | 'material' | 'otherReader';
  title: string;
  subtitle?: string;
  url: string;
}

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const matchesQuery = (text: string | undefined, query: string): boolean => {
  if (!text) return false;
  return normalizeString(text).includes(normalizeString(query));
};

export function useGlobalSearch(query: string) {
  const { 
    books, 
    participants, 
    classes, 
    tasks, 
    loans, 
    materials, 
    otherReaders,
    getBookById,
    getParticipantById,
    getOtherReaderById,
  } = useLibraryStore();

  const results = useMemo(() => {
    if (!query || query.length < 2) {
      return {
        books: [],
        participants: [],
        classes: [],
        tasks: [],
        loans: [],
        materials: [],
        otherReaders: [],
      };
    }

    const bookResults: SearchResult[] = books
      .filter(book => 
        matchesQuery(book.title, query) || 
        matchesQuery(book.author, query) || 
        matchesQuery(book.isbn, query)
      )
      .slice(0, 5)
      .map(book => ({
        id: book.id,
        type: 'book' as const,
        title: book.title,
        subtitle: book.author,
        url: `/books?search=${encodeURIComponent(book.title)}`,
      }));

    const participantResults: SearchResult[] = participants
      .filter(p => 
        matchesQuery(p.firstName, query) || 
        matchesQuery(p.lastName, query) || 
        matchesQuery(p.participantNumber, query)
      )
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        type: 'participant' as const,
        title: `${p.firstName} ${p.lastName}`,
        subtitle: p.participantNumber,
        url: `/participants?search=${encodeURIComponent(p.firstName)}`,
      }));

    const classResults: SearchResult[] = classes
      .filter(c => 
        matchesQuery(c.name, query) || 
        matchesQuery(c.monitorName, query)
      )
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        type: 'class' as const,
        title: c.name,
        subtitle: c.monitorName ? `Moniteur: ${c.monitorName}` : undefined,
        url: `/participants?class=${c.id}`,
      }));

    const taskResults: SearchResult[] = tasks
      .filter(t => 
        matchesQuery(t.title, query) || 
        matchesQuery(t.description, query)
      )
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        type: 'task' as const,
        title: t.title,
        subtitle: t.status === 'completed' ? 'Terminée' : t.status === 'in_progress' ? 'En cours' : 'En attente',
        url: '/tasks',
      }));

    const loanResults: SearchResult[] = loans
      .filter(loan => {
        const book = getBookById(loan.bookId);
        if (loan.borrowerType === 'participant') {
          const participant = getParticipantById(loan.borrowerId);
          return matchesQuery(book?.title, query) || 
                 matchesQuery(participant?.firstName, query) ||
                 matchesQuery(participant?.lastName, query);
        } else {
          const reader = getOtherReaderById(loan.borrowerId);
          return matchesQuery(book?.title, query) || 
                 matchesQuery(reader?.firstName, query) ||
                 matchesQuery(reader?.lastName, query);
        }
      })
      .slice(0, 5)
      .map(loan => {
        const book = getBookById(loan.bookId);
        let borrowerName = '';
        if (loan.borrowerType === 'participant') {
          const p = getParticipantById(loan.borrowerId);
          borrowerName = p ? `${p.firstName} ${p.lastName}` : '';
        } else {
          const r = getOtherReaderById(loan.borrowerId);
          borrowerName = r ? `${r.firstName} ${r.lastName}` : '';
        }
        return {
          id: loan.id,
          type: 'loan' as const,
          title: book?.title || 'Livre inconnu',
          subtitle: `Emprunté par ${borrowerName}`,
          url: '/loans',
        };
      });

    const materialResults: SearchResult[] = materials
      .filter(m => 
        matchesQuery(m.name, query) || 
        matchesQuery(m.serialNumber, query)
      )
      .slice(0, 5)
      .map(m => ({
        id: m.id,
        type: 'material' as const,
        title: m.name,
        subtitle: m.serialNumber,
        url: '/materials',
      }));

    const otherReaderResults: SearchResult[] = otherReaders
      .filter(r => 
        matchesQuery(r.firstName, query) || 
        matchesQuery(r.lastName, query) || 
        matchesQuery(r.readerNumber, query)
      )
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        type: 'otherReader' as const,
        title: `${r.firstName} ${r.lastName}`,
        subtitle: r.readerNumber,
        url: '/other-readers',
      }));

    return {
      books: bookResults,
      participants: participantResults,
      classes: classResults,
      tasks: taskResults,
      loans: loanResults,
      materials: materialResults,
      otherReaders: otherReaderResults,
    };
  }, [query, books, participants, classes, tasks, loans, materials, otherReaders, getBookById, getParticipantById, getOtherReaderById]);

  const totalResults = useMemo(() => {
    return Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
  }, [results]);

  return { results, totalResults };
}
