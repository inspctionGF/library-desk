import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  quantity: number;
  availableCopies: number;
  coverUrl: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  bookId: string;
  participantId: string;
  participantName: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'active' | 'returned' | 'overdue';
}

export type AgeRange = '3-5' | '6-8' | '9-11' | '12-14' | '15-18' | '19-22';

export interface Participant {
  id: string;
  participantNumber: string;  // Format: HA-{cdejNumber}-XXXXX
  firstName: string;
  lastName: string;
  age: number;
  ageRange: AgeRange;  // Auto-calculated from age
  classId: string;
  gender: 'M' | 'F';
  createdAt: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  ageRange: AgeRange;
  monitorName: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'guest';
  phone: string;
  notes: string;
  avatarUrl: string;
  createdAt: string;
}

export interface ExtraActivityType {
  id: string;
  name: string;
  color: string;
  description: string;
  createdAt: string;
}

export interface ExtraActivity {
  id: string;
  activityTypeId: string;
  date: string;
  memo: string;
  createdAt: string;
}

export interface BookResume {
  id: string;
  participantNumber: string;
  bookId: string;
  date: string;
  status: 'generated' | 'submitted' | 'reviewed';
  summary?: string;
  whatILearned?: string;
  rating?: number;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
}

export type ReadingType = 'assignment' | 'research' | 'normal';

export interface ReadingSession {
  id: string;
  participantId: string;
  bookId: string;
  sessionDate: string;
  readingType: ReadingType;
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = 'bibliosystem_data';

const defaultCategories: Category[] = [
  { id: '1', name: 'Adventure', description: 'Exciting adventure stories', color: 'hsl(262, 83%, 58%)' },
  { id: '2', name: 'Fantasy', description: 'Magical worlds and creatures', color: 'hsl(174, 72%, 40%)' },
  { id: '3', name: 'Science', description: 'Learn about the world', color: 'hsl(25, 95%, 53%)' },
  { id: '4', name: 'Mystery', description: 'Solve the puzzle', color: 'hsl(340, 75%, 55%)' },
  { id: '5', name: 'Comics', description: 'Graphic novels and comics', color: 'hsl(200, 80%, 50%)' },
];

const defaultBooks: Book[] = [
  { id: '1', title: 'The Magic Treehouse', author: 'Mary Pope Osborne', isbn: '978-0679824114', categoryId: '1', quantity: 5, availableCopies: 3, coverUrl: '', createdAt: '2024-01-15' },
  { id: '2', title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', isbn: '978-0439708180', categoryId: '2', quantity: 8, availableCopies: 5, coverUrl: '', createdAt: '2024-01-10' },
  { id: '3', title: 'Diary of a Wimpy Kid', author: 'Jeff Kinney', isbn: '978-0810993136', categoryId: '5', quantity: 10, availableCopies: 7, coverUrl: '', createdAt: '2024-01-12' },
  { id: '4', title: 'The One and Only Ivan', author: 'Katherine Applegate', isbn: '978-0061992254', categoryId: '1', quantity: 4, availableCopies: 2, coverUrl: '', createdAt: '2024-01-08' },
  { id: '5', title: 'Wonder', author: 'R.J. Palacio', isbn: '978-0375869020', categoryId: '1', quantity: 6, availableCopies: 4, coverUrl: '', createdAt: '2024-01-20' },
  { id: '6', title: 'Percy Jackson: The Lightning Thief', author: 'Rick Riordan', isbn: '978-0786838653', categoryId: '2', quantity: 7, availableCopies: 3, coverUrl: '', createdAt: '2024-02-01' },
  { id: '7', title: 'National Geographic Kids Encyclopedia', author: 'National Geographic', isbn: '978-1426325427', categoryId: '3', quantity: 3, availableCopies: 2, coverUrl: '', createdAt: '2024-02-05' },
  { id: '8', title: 'The Wild Robot', author: 'Peter Brown', isbn: '978-0316381994', categoryId: '3', quantity: 5, availableCopies: 5, coverUrl: '', createdAt: '2024-02-10' },
  { id: '9', title: 'Cam Jansen Mystery Series', author: 'David A. Adler', isbn: '978-0142400203', categoryId: '4', quantity: 6, availableCopies: 4, coverUrl: '', createdAt: '2024-02-15' },
  { id: '10', title: 'Dog Man', author: 'Dav Pilkey', isbn: '978-0545581608', categoryId: '5', quantity: 12, availableCopies: 8, coverUrl: '', createdAt: '2024-02-20' },
  { id: '11', title: 'Charlotte\'s Web', author: 'E.B. White', isbn: '978-0064400558', categoryId: '1', quantity: 4, availableCopies: 1, coverUrl: '', createdAt: '2024-03-01' },
  { id: '12', title: 'The Chronicles of Narnia', author: 'C.S. Lewis', isbn: '978-0066238500', categoryId: '2', quantity: 5, availableCopies: 3, coverUrl: '', createdAt: '2024-03-05' },
];

const defaultClasses: SchoolClass[] = [
  { id: '1', name: 'Classe Étoiles', ageRange: '3-5', monitorName: 'Mme Dupont', createdAt: '2024-01-01' },
  { id: '2', name: 'Classe Soleil', ageRange: '6-8', monitorName: 'M. Martin', createdAt: '2024-01-01' },
  { id: '3', name: 'Classe Lune', ageRange: '9-11', monitorName: 'Mme Bernard', createdAt: '2024-01-01' },
  { id: '4', name: 'Classe Comètes', ageRange: '12-14', monitorName: 'M. Petit', createdAt: '2024-01-01' },
];

const defaultParticipants: Participant[] = [
  { id: '1', participantNumber: 'HA-0000-00001', firstName: 'Emma', lastName: 'Wilson', age: 4, ageRange: '3-5', classId: '1', gender: 'F', createdAt: '2024-01-05' },
  { id: '2', participantNumber: 'HA-0000-00002', firstName: 'Liam', lastName: 'Brown', age: 5, ageRange: '3-5', classId: '1', gender: 'M', createdAt: '2024-01-05' },
  { id: '3', participantNumber: 'HA-0000-00003', firstName: 'Olivia', lastName: 'Garcia', age: 7, ageRange: '6-8', classId: '2', gender: 'F', createdAt: '2024-01-06' },
  { id: '4', participantNumber: 'HA-0000-00004', firstName: 'Noah', lastName: 'Martinez', age: 10, ageRange: '9-11', classId: '3', gender: 'M', createdAt: '2024-01-07' },
  { id: '5', participantNumber: 'HA-0000-00005', firstName: 'Ava', lastName: 'Anderson', age: 13, ageRange: '12-14', classId: '4', gender: 'F', createdAt: '2024-01-08' },
];

const defaultLoans: Loan[] = [
  { id: '1', bookId: '1', participantId: '1', participantName: 'Emma Wilson', loanDate: '2024-12-01', dueDate: '2024-12-15', returnDate: null, status: 'active' },
  { id: '2', bookId: '2', participantId: '2', participantName: 'Liam Brown', loanDate: '2024-11-20', dueDate: '2024-12-04', returnDate: null, status: 'overdue' },
  { id: '3', bookId: '6', participantId: '3', participantName: 'Olivia Garcia', loanDate: '2024-12-05', dueDate: '2024-12-19', returnDate: null, status: 'active' },
  { id: '4', bookId: '3', participantId: '4', participantName: 'Noah Martinez', loanDate: '2024-11-15', dueDate: '2024-11-29', returnDate: '2024-11-28', status: 'returned' },
];

const defaultTasks: Task[] = [
  { id: '1', title: 'Inventaire des livres', description: 'Vérifier le stock de tous les livres de la bibliothèque', priority: 'high', status: 'todo', dueDate: '2024-12-15', createdAt: '2024-12-01', completedAt: null },
  { id: '2', title: 'Commander nouveaux livres', description: 'Commander les livres populaires en rupture de stock', priority: 'medium', status: 'in_progress', dueDate: '2024-12-20', createdAt: '2024-12-02', completedAt: null },
  { id: '3', title: 'Mettre à jour les catégories', description: 'Ajouter de nouvelles catégories pour les livres numériques', priority: 'low', status: 'todo', dueDate: '2024-12-25', createdAt: '2024-12-03', completedAt: null },
  { id: '4', title: 'Envoyer rappels retard', description: 'Contacter les participants avec des livres en retard', priority: 'high', status: 'completed', dueDate: '2024-12-05', createdAt: '2024-12-01', completedAt: '2024-12-05' },
  { id: '5', title: 'Préparer rapport mensuel', description: 'Générer le rapport de statistiques du mois', priority: 'medium', status: 'todo', dueDate: '2024-12-30', createdAt: '2024-12-05', completedAt: null },
];

const defaultUserProfiles: UserProfile[] = [
  { id: '1', name: 'Admin User', email: 'admin@bibliosystem.com', role: 'admin', phone: '+33 1 23 45 67 89', notes: 'Administrateur principal du système', avatarUrl: '', createdAt: '2024-01-01' },
];

const defaultExtraActivityTypes: ExtraActivityType[] = [
  { id: '1', name: 'Réunion staff', color: 'hsl(262, 83%, 58%)', description: 'Réunions internes du personnel', createdAt: '2024-01-01' },
  { id: '2', name: 'Évangélisation', color: 'hsl(174, 72%, 40%)', description: 'Activités d\'évangélisation', createdAt: '2024-01-01' },
  { id: '3', name: 'Formation', color: 'hsl(25, 95%, 53%)', description: 'Sessions de formation', createdAt: '2024-01-01' },
  { id: '4', name: 'Visite', color: 'hsl(200, 80%, 50%)', description: 'Visites et sorties', createdAt: '2024-01-01' },
];

const defaultExtraActivities: ExtraActivity[] = [
  { id: '1', activityTypeId: '1', date: '2024-12-01', memo: 'Planification des activités de Noël', createdAt: '2024-12-01' },
  { id: '2', activityTypeId: '2', date: '2024-12-05', memo: 'Distribution de tracts dans le quartier', createdAt: '2024-12-05' },
];

const defaultReadingSessions: ReadingSession[] = [
  { id: '1', participantId: '1', bookId: '1', sessionDate: '2024-12-01', readingType: 'normal', notes: 'Première lecture', createdAt: '2024-12-01' },
  { id: '2', participantId: '3', bookId: '2', sessionDate: '2024-12-05', readingType: 'assignment', notes: 'Devoir de lecture', createdAt: '2024-12-05' },
];

interface LibraryData {
  categories: Category[];
  books: Book[];
  classes: SchoolClass[];
  participants: Participant[];
  loans: Loan[];
  tasks: Task[];
  userProfiles: UserProfile[];
  extraActivityTypes: ExtraActivityType[];
  extraActivities: ExtraActivity[];
  bookResumes: BookResume[];
  readingSessions: ReadingSession[];
}

function loadData(): LibraryData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure tasks exist (migration for existing data)
      if (!parsed.tasks) {
        parsed.tasks = defaultTasks;
      }
      // Ensure userProfiles exist (migration for existing data)
      if (!parsed.userProfiles) {
        parsed.userProfiles = defaultUserProfiles;
      }
      // Ensure extraActivityTypes exist (migration for existing data)
      if (!parsed.extraActivityTypes) {
        parsed.extraActivityTypes = defaultExtraActivityTypes;
      }
      // Ensure extraActivities exist (migration for existing data)
      if (!parsed.extraActivities) {
        parsed.extraActivities = defaultExtraActivities;
      }
      // Ensure bookResumes exist (migration for existing data)
      if (!parsed.bookResumes) {
        parsed.bookResumes = [];
      }
      // Ensure readingSessions exist (migration for existing data)
      if (!parsed.readingSessions) {
        parsed.readingSessions = defaultReadingSessions;
      }
      // Migrate old participants to new structure
      if (parsed.participants && parsed.participants.length > 0) {
        parsed.participants = parsed.participants.map((p: any, index: number) => {
          // Check if already migrated (has firstName field)
          if (p.firstName) return p;
          // Migrate old format (name, pin) to new format
          const nameParts = (p.name || '').split(' ');
          const firstName = nameParts[0] || 'Prénom';
          const lastName = nameParts.slice(1).join(' ') || 'Nom';
          return {
            ...p,
            firstName,
            lastName,
            participantNumber: p.participantNumber || `HA-0000-${(index + 1).toString().padStart(5, '0')}`,
            age: p.age || 10,
            ageRange: p.ageRange || '9-11',
            gender: p.gender || 'M',
          };
        });
      }
      // Migrate old classes to new structure
      if (parsed.classes && parsed.classes.length > 0) {
        parsed.classes = parsed.classes.map((c: any) => {
          if (c.ageRange) return c;
          // Migrate old format (teacherName, year) to new format (monitorName, ageRange)
          return {
            ...c,
            ageRange: c.ageRange || '6-8',
            monitorName: c.monitorName || c.teacherName || '',
            createdAt: c.createdAt || new Date().toISOString().split('T')[0],
          };
        });
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load library data:', e);
  }
  return {
    categories: defaultCategories,
    books: defaultBooks,
    classes: defaultClasses,
    participants: defaultParticipants,
    loans: defaultLoans,
    tasks: defaultTasks,
    userProfiles: defaultUserProfiles,
    extraActivityTypes: defaultExtraActivityTypes,
    extraActivities: defaultExtraActivities,
    bookResumes: [],
    readingSessions: defaultReadingSessions,
  };
}

function saveData(data: LibraryData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save library data:', e);
  }
}

export function useLibraryStore() {
  const [data, setData] = useState<LibraryData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Book operations
  const addBook = (book: Omit<Book, 'id' | 'createdAt' | 'availableCopies'>) => {
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
      availableCopies: book.quantity,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, books: [...prev.books, newBook] }));
    return newBook;
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setData(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  };

  const deleteBook = (id: string) => {
    setData(prev => ({
      ...prev,
      books: prev.books.filter(b => b.id !== id),
    }));
  };

  // Category operations
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setData(prev => ({ ...prev, categories: [...prev.categories, newCategory] }));
    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const deleteCategory = (id: string) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
    }));
  };

  // Task operations
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      completedAt: null,
    };
    setData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          // Auto-set completedAt when status changes to completed
          if (updates.status === 'completed' && t.status !== 'completed') {
            updated.completedAt = new Date().toISOString().split('T')[0];
          } else if (updates.status && updates.status !== 'completed') {
            updated.completedAt = null;
          }
          return updated;
        }
        return t;
      }),
    }));
  };

  const deleteTask = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  };

  const toggleTaskStatus = (id: string) => {
    const task = data.tasks.find(t => t.id === id);
    if (task) {
      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      updateTask(id, { status: newStatus });
    }
  };

  // Getters
  const getCategoryById = (id: string) => data.categories.find(c => c.id === id);
  const getBookById = (id: string) => data.books.find(b => b.id === id);
  const getParticipantById = (id: string) => data.participants.find(p => p.id === id);
  const getUserProfileById = (id: string) => data.userProfiles.find(p => p.id === id);

  // User Profile operations
  const addUserProfile = (profile: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const newProfile: UserProfile = {
      ...profile,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, userProfiles: [...prev.userProfiles, newProfile] }));
    return newProfile;
  };

  const updateUserProfile = (id: string, updates: Partial<UserProfile>) => {
    setData(prev => ({
      ...prev,
      userProfiles: prev.userProfiles.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  };

  const deleteUserProfile = (id: string) => {
    setData(prev => ({
      ...prev,
      userProfiles: prev.userProfiles.filter(p => p.id !== id),
    }));
  };

  // Extra Activity Type operations
  const addExtraActivityType = (type: Omit<ExtraActivityType, 'id' | 'createdAt'>) => {
    const newType: ExtraActivityType = {
      ...type,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, extraActivityTypes: [...prev.extraActivityTypes, newType] }));
    return newType;
  };

  const updateExtraActivityType = (id: string, updates: Partial<ExtraActivityType>) => {
    setData(prev => ({
      ...prev,
      extraActivityTypes: prev.extraActivityTypes.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  };

  const deleteExtraActivityType = (id: string) => {
    setData(prev => ({
      ...prev,
      extraActivityTypes: prev.extraActivityTypes.filter(t => t.id !== id),
    }));
  };

  // Extra Activity operations
  const addExtraActivity = (activity: Omit<ExtraActivity, 'id' | 'createdAt'>) => {
    const newActivity: ExtraActivity = {
      ...activity,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, extraActivities: [...prev.extraActivities, newActivity] }));
    return newActivity;
  };

  const updateExtraActivity = (id: string, updates: Partial<ExtraActivity>) => {
    setData(prev => ({
      ...prev,
      extraActivities: prev.extraActivities.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  };

  const deleteExtraActivity = (id: string) => {
    setData(prev => ({
      ...prev,
      extraActivities: prev.extraActivities.filter(a => a.id !== id),
    }));
  };

  const getTaskById = (id: string) => data.tasks.find(t => t.id === id);
  const getExtraActivityTypeById = (id: string) => data.extraActivityTypes.find(t => t.id === id);
  const getExtraActivityById = (id: string) => data.extraActivities.find(a => a.id === id);
  const getBookResumeById = (id: string) => data.bookResumes.find(r => r.id === id);

  // Book Resume operations
  const addBookResume = (resume: Omit<BookResume, 'id' | 'createdAt'>) => {
    const newResume: BookResume = {
      ...resume,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, bookResumes: [...prev.bookResumes, newResume] }));
    return newResume;
  };

  const updateBookResume = (id: string, updates: Partial<BookResume>) => {
    setData(prev => ({
      ...prev,
      bookResumes: prev.bookResumes.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  };

  const deleteBookResume = (id: string) => {
    setData(prev => ({
      ...prev,
      bookResumes: prev.bookResumes.filter(r => r.id !== id),
    }));
  };

  // Reading Session operations
  const addReadingSession = (session: Omit<ReadingSession, 'id' | 'createdAt'>) => {
    const newSession: ReadingSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, readingSessions: [...prev.readingSessions, newSession] }));
    return newSession;
  };

  const updateReadingSession = (id: string, updates: Partial<ReadingSession>) => {
    setData(prev => ({
      ...prev,
      readingSessions: prev.readingSessions.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  };

  const deleteReadingSession = (id: string) => {
    setData(prev => ({
      ...prev,
      readingSessions: prev.readingSessions.filter(s => s.id !== id),
    }));
  };

  const getReadingSessionById = (id: string) => data.readingSessions.find(s => s.id === id);
  const getReadingSessionsByParticipant = (participantId: string) => data.readingSessions.filter(s => s.participantId === participantId);
  const getReadingSessionsByBook = (bookId: string) => data.readingSessions.filter(s => s.bookId === bookId);

  // Helper function to get age range from age
  const getAgeRangeFromAge = (age: number): AgeRange => {
    if (age >= 3 && age <= 5) return '3-5';
    if (age >= 6 && age <= 8) return '6-8';
    if (age >= 9 && age <= 11) return '9-11';
    if (age >= 12 && age <= 14) return '12-14';
    if (age >= 15 && age <= 18) return '15-18';
    if (age >= 19 && age <= 22) return '19-22';
    if (age < 3) return '3-5';
    return '19-22';
  };

  const getNextParticipantNumber = (cdejNumber: string): string => {
    const existing = data.participants
      .filter(p => p.participantNumber) // Filter out participants without participantNumber
      .map(p => {
        const parts = p.participantNumber.split('-');
        return parseInt(parts[parts.length - 1] || '0');
      });
    const max = Math.max(0, ...existing);
    const next = (max + 1).toString().padStart(5, '0');
    const prefix = cdejNumber.startsWith('HA-') ? cdejNumber : `HA-${cdejNumber}`;
    return `${prefix}-${next}`;
  };

  const addClass = (classData: Omit<SchoolClass, 'id' | 'createdAt'>) => {
    const newClass: SchoolClass = { ...classData, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] };
    setData(prev => ({ ...prev, classes: [...prev.classes, newClass] }));
    return newClass;
  };

  const updateClass = (id: string, updates: Partial<SchoolClass>) => {
    setData(prev => ({ ...prev, classes: prev.classes.map(c => c.id === id ? { ...c, ...updates } : c) }));
  };

  const deleteClass = (id: string) => {
    setData(prev => ({ ...prev, classes: prev.classes.filter(c => c.id !== id) }));
  };

  const getClassById = (id: string) => data.classes.find(c => c.id === id);

  const addParticipant = (participantData: Omit<Participant, 'id' | 'createdAt' | 'participantNumber' | 'ageRange'>) => {
    const cdejNumber = localStorage.getItem('bibliosystem_config') ? JSON.parse(localStorage.getItem('bibliosystem_config') || '{}').cdejNumber || '0000' : '0000';
    const newParticipant: Participant = {
      ...participantData,
      id: Date.now().toString(),
      participantNumber: getNextParticipantNumber(cdejNumber),
      ageRange: getAgeRangeFromAge(participantData.age),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, participants: [...prev.participants, newParticipant] }));
    return newParticipant;
  };

  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setData(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          if (updates.age !== undefined) updated.ageRange = getAgeRangeFromAge(updates.age);
          return updated;
        }
        return p;
      }),
    }));
  };

  const deleteParticipant = (id: string) => {
    setData(prev => ({ ...prev, participants: prev.participants.filter(p => p.id !== id) }));
  };

  const getParticipantsByClass = (classId: string) => data.participants.filter(p => p.classId === classId);

  const getStats = () => {
    const totalBooks = data.books.reduce((sum, b) => sum + b.quantity, 0);
    const availableBooks = data.books.reduce((sum, b) => sum + b.availableCopies, 0);
    const activeLoans = data.loans.filter(l => l.status === 'active').length;
    const overdueLoans = data.loans.filter(l => l.status === 'overdue').length;
    const totalParticipants = data.participants.length;
    const booksThisWeek = data.loans.filter(l => {
      const loanDate = new Date(l.loanDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return loanDate >= weekAgo;
    }).length;

    return { totalBooks, availableBooks, activeLoans, overdueLoans, totalParticipants, booksThisWeek };
  };

  const getTaskStats = () => {
    const total = data.tasks.length;
    const completed = data.tasks.filter(t => t.status === 'completed').length;
    const inProgress = data.tasks.filter(t => t.status === 'in_progress').length;
    const todo = data.tasks.filter(t => t.status === 'todo').length;
    const overdue = data.tasks.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;
    const highPriority = data.tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;

    return { total, completed, inProgress, todo, overdue, highPriority };
  };

  const getRecentActivity = () => {
    return [...data.loans]
      .sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime())
      .slice(0, 5)
      .map(loan => {
        const book = getBookById(loan.bookId);
        return {
          ...loan,
          bookTitle: book?.title || 'Unknown Book',
        };
      });
  };

  const getUpcomingTasks = (limit = 5) => {
    return [...data.tasks]
      .filter(t => t.status !== 'completed')
      .sort((a, b) => {
        // Sort by priority first, then by due date
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, limit);
  };

  return {
    ...data,
    addBook,
    updateBook,
    deleteBook,
    addCategory,
    updateCategory,
    deleteCategory,
    addClass,
    updateClass,
    deleteClass,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    addUserProfile,
    updateUserProfile,
    deleteUserProfile,
    addExtraActivityType,
    updateExtraActivityType,
    deleteExtraActivityType,
    addExtraActivity,
    updateExtraActivity,
    deleteExtraActivity,
    addBookResume,
    updateBookResume,
    deleteBookResume,
    addReadingSession,
    updateReadingSession,
    deleteReadingSession,
    getCategoryById,
    getBookById,
    getClassById,
    getParticipantById,
    getParticipantsByClass,
    getNextParticipantNumber,
    getTaskById,
    getUserProfileById,
    getExtraActivityTypeById,
    getExtraActivityById,
    getBookResumeById,
    getReadingSessionById,
    getReadingSessionsByParticipant,
    getReadingSessionsByBook,
    getStats,
    getTaskStats,
    getRecentActivity,
    getUpcomingTasks,
  };
}