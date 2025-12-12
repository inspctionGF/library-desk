import { useState, useEffect, useCallback, useRef } from 'react';
import {
  booksApi,
  categoriesApi,
  participantsApi,
  classesApi,
  loansApi,
  tasksApi,
  materialsApi,
  inventoryApi,
  readingSessionsApi,
  bookIssuesApi,
  bookResumesApi,
  otherReadersApi,
  extraActivitiesApi,
} from '@/services/api';

// ============ TYPE DEFINITIONS ============
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

export type BorrowerType = 'participant' | 'other_reader';

export interface Loan {
  id: string;
  bookId: string;
  borrowerType: BorrowerType;
  borrowerId: string;
  borrowerName: string;
  participantId?: string;
  participantName?: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'active' | 'returned' | 'overdue';
}

export type ReaderType = 'parent' | 'instructor' | 'staff' | 'other';

export interface OtherReader {
  id: string;
  readerNumber: string;
  firstName: string;
  lastName: string;
  readerType: ReaderType;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export type AgeRange = '3-5' | '6-8' | '9-11' | '12-14' | '15-18' | '19-22';

export interface Participant {
  id: string;
  participantNumber: string;
  firstName: string;
  lastName: string;
  age: number;
  ageRange: AgeRange;
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
  avatarData?: string;
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
export type ClassSessionType = 'bulk' | 'detailed';

export interface ReadingSession {
  id: string;
  participantId: string;
  bookId: string;
  sessionDate: string;
  readingType: ReadingType;
  notes?: string;
  classSessionId?: string;
  createdAt: string;
}

export interface ClassReadingSession {
  id: string;
  classId: string;
  sessionDate: string;
  attendeeCount: number;
  sessionType: ClassSessionType;
  notes?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  type: string;
  subject: string;
  message: string;
  cdejNumber: string;
  churchName: string;
  status: 'pending' | 'sent' | 'reviewed';
  createdAt: string;
}

export type InventoryType = 'annual' | 'adhoc';
export type InventoryStatus = 'in_progress' | 'completed' | 'cancelled';
export type InventoryItemStatus = 'pending' | 'checked' | 'discrepancy';

export interface InventorySession {
  id: string;
  name: string;
  type: InventoryType;
  status: InventoryStatus;
  startDate: string;
  endDate?: string;
  totalBooks: number;
  checkedBooks: number;
  foundBooks: number;
  missingBooks: number;
  notes?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  inventorySessionId: string;
  bookId: string;
  expectedQuantity: number;
  foundQuantity?: number;
  status: InventoryItemStatus;
  checkedAt?: string;
  notes?: string;
}

export type MaterialCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type EntityType = 'church' | 'school' | 'association' | 'other';
export type MaterialBorrowerType = 'participant' | 'entity';

export interface MaterialType {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  materialTypeId: string;
  serialNumber?: string;
  quantity: number;
  availableQuantity: number;
  condition: MaterialCondition;
  notes?: string;
  createdAt: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface MaterialLoan {
  id: string;
  materialId: string;
  borrowerType: MaterialBorrowerType;
  borrowerId: string;
  borrowerName: string;
  quantity: number;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
  createdAt: string;
}

export type BookIssueType = 'not_returned' | 'damaged' | 'torn' | 'lost' | 'other';
export type BookIssueStatus = 'open' | 'resolved' | 'written_off';

export interface BookIssue {
  id: string;
  bookId: string;
  issueType: BookIssueType;
  quantity: number;
  loanId?: string;
  borrowerName?: string;
  borrowerContact?: string;
  reportDate: string;
  status: BookIssueStatus;
  resolution?: string;
  resolvedAt?: string;
  notes?: string;
  createdAt: string;
}

export type NotificationType = 'task' | 'overdue_loan' | 'book_issue' | 'inventory' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// ============ STORAGE & DEFAULTS ============
const STORAGE_KEY = 'bibliosystem_data';
const API_MODE_KEY = 'bibliosystem_api_mode';

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
  { id: '1', bookId: '1', borrowerType: 'participant', borrowerId: '1', borrowerName: 'Emma Wilson', participantId: '1', participantName: 'Emma Wilson', loanDate: '2024-12-01', dueDate: '2024-12-15', returnDate: null, status: 'active' },
  { id: '2', bookId: '2', borrowerType: 'participant', borrowerId: '2', borrowerName: 'Liam Brown', participantId: '2', participantName: 'Liam Brown', loanDate: '2024-11-20', dueDate: '2024-12-04', returnDate: null, status: 'overdue' },
  { id: '3', bookId: '6', borrowerType: 'participant', borrowerId: '3', borrowerName: 'Olivia Garcia', participantId: '3', participantName: 'Olivia Garcia', loanDate: '2024-12-05', dueDate: '2024-12-19', returnDate: null, status: 'active' },
  { id: '4', bookId: '3', borrowerType: 'participant', borrowerId: '4', borrowerName: 'Noah Martinez', participantId: '4', participantName: 'Noah Martinez', loanDate: '2024-11-15', dueDate: '2024-11-29', returnDate: '2024-11-28', status: 'returned' },
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

const defaultMaterialTypes: MaterialType[] = [
  { id: '1', name: 'Jeu de société', color: 'hsl(262, 83%, 58%)', description: 'Jeux de plateau et cartes', createdAt: '2024-01-01' },
  { id: '2', name: 'Équipement audiovisuel', color: 'hsl(174, 72%, 40%)', description: 'Télévisions, projecteurs, etc.', createdAt: '2024-01-01' },
  { id: '3', name: 'Matériel pédagogique', color: 'hsl(25, 95%, 53%)', description: 'Outils éducatifs', createdAt: '2024-01-01' },
  { id: '4', name: 'Mobilier', color: 'hsl(200, 80%, 50%)', description: 'Tables, chaises, etc.', createdAt: '2024-01-01' },
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
  classReadingSessions: ClassReadingSession[];
  feedbacks: Feedback[];
  inventorySessions: InventorySession[];
  inventoryItems: InventoryItem[];
  materialTypes: MaterialType[];
  materials: Material[];
  entities: Entity[];
  materialLoans: MaterialLoan[];
  otherReaders: OtherReader[];
  bookIssues: BookIssue[];
  notifications: Notification[];
}

// ============ HELPER FUNCTIONS ============
function getAgeRangeFromAge(age: number): AgeRange {
  if (age >= 3 && age <= 5) return '3-5';
  if (age >= 6 && age <= 8) return '6-8';
  if (age >= 9 && age <= 11) return '9-11';
  if (age >= 12 && age <= 14) return '12-14';
  if (age >= 15 && age <= 18) return '15-18';
  if (age >= 19 && age <= 22) return '19-22';
  if (age < 3) return '3-5';
  return '19-22';
}

function migrateData(parsed: any): LibraryData {
  if (!parsed.tasks) parsed.tasks = defaultTasks;
  if (!parsed.userProfiles) parsed.userProfiles = defaultUserProfiles;
  if (!parsed.extraActivityTypes) parsed.extraActivityTypes = defaultExtraActivityTypes;
  if (!parsed.extraActivities) parsed.extraActivities = defaultExtraActivities;
  if (!parsed.bookResumes) parsed.bookResumes = [];
  if (!parsed.readingSessions) parsed.readingSessions = defaultReadingSessions;
  if (!parsed.classReadingSessions) parsed.classReadingSessions = [];
  if (!parsed.feedbacks) parsed.feedbacks = [];
  if (!parsed.inventorySessions) parsed.inventorySessions = [];
  if (!parsed.inventoryItems) parsed.inventoryItems = [];
  if (!parsed.materialTypes) parsed.materialTypes = defaultMaterialTypes;
  if (!parsed.materials) parsed.materials = [];
  if (!parsed.entities) parsed.entities = [];
  if (!parsed.materialLoans) parsed.materialLoans = [];
  if (!parsed.otherReaders) parsed.otherReaders = [];
  if (!parsed.bookIssues) parsed.bookIssues = [];
  if (!parsed.notifications) parsed.notifications = [];

  // Migrate old loans to new structure
  if (parsed.loans && parsed.loans.length > 0) {
    parsed.loans = parsed.loans.map((l: any) => ({
      ...l,
      borrowerType: l.borrowerType || 'participant',
      borrowerId: l.borrowerId || l.participantId,
      borrowerName: l.borrowerName || l.participantName,
    }));
  }

  // Migrate old participants to new structure
  if (parsed.participants && parsed.participants.length > 0) {
    parsed.participants = parsed.participants.map((p: any, index: number) => {
      if (p.firstName) return p;
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

function loadLocalData(): LibraryData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return migrateData(parsed);
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
    classReadingSessions: [],
    feedbacks: [],
    inventorySessions: [],
    inventoryItems: [],
    materialTypes: defaultMaterialTypes,
    materials: [],
    entities: [],
    materialLoans: [],
    otherReaders: [],
    bookIssues: [],
    notifications: [],
  };
}

function saveLocalData(data: LibraryData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save library data:', e);
  }
}

// Check if API is available
async function checkApiAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ============ MAIN HOOK ============
export function useLibraryStore() {
  const [data, setData] = useState<LibraryData>(loadLocalData);
  const [isApiMode, setIsApiMode] = useState<boolean>(() => {
    return localStorage.getItem(API_MODE_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const apiCheckedRef = useRef(false);

  // Check API availability on mount
  useEffect(() => {
    if (apiCheckedRef.current) return;
    apiCheckedRef.current = true;

    checkApiAvailability().then((available) => {
      if (available) {
        setIsApiMode(true);
        localStorage.setItem(API_MODE_KEY, 'true');
        // Load data from API
        refreshFromApi();
      } else {
        setIsApiMode(false);
        localStorage.setItem(API_MODE_KEY, 'false');
      }
    });
  }, []);

  // Save to localStorage when data changes (fallback mode)
  useEffect(() => {
    if (!isApiMode) {
      saveLocalData(data);
    }
  }, [data, isApiMode]);

  // Refresh data from API
  const refreshFromApi = useCallback(async () => {
    if (!isApiMode) return;
    
    setIsLoading(true);
    try {
      const [
        booksRes,
        categoriesRes,
        participantsRes,
        classesRes,
        loansRes,
        tasksRes,
      ] = await Promise.all([
        booksApi.getAll().catch(() => null),
        categoriesApi.getAll().catch(() => null),
        participantsApi.getAll().catch(() => null),
        classesApi.getAll().catch(() => null),
        loansApi.getAll().catch(() => null),
        tasksApi.getAll().catch(() => null),
      ]);

      setData(prev => ({
        ...prev,
        books: booksRes || prev.books,
        categories: (categoriesRes || prev.categories).map((c: any) => ({
          ...c,
          description: c.description || '',
        })),
        participants: (participantsRes || prev.participants).map((p: any) => ({
          ...p,
          ageRange: p.ageRange || getAgeRangeFromAge(p.age),
        })),
        classes: (classesRes || prev.classes).map((c: any) => ({
          ...c,
          ageRange: c.ageRange || '6-8',
        })),
        loans: (loansRes || prev.loans).map((l: any) => ({
          ...l,
          borrowerType: l.borrowerType || 'participant',
          borrowerId: l.borrowerId || l.participantId,
          borrowerName: l.borrowerName || l.participantName,
          participantId: l.participantId || l.borrowerId,
          participantName: l.participantName || l.borrowerName,
        })),
        tasks: tasksRes || prev.tasks,
      }));
    } catch (error) {
      console.error('Failed to refresh from API:', error);
      // Fall back to localStorage
      setIsApiMode(false);
      localStorage.setItem(API_MODE_KEY, 'false');
    } finally {
      setIsLoading(false);
    }
  }, [isApiMode]);

  // ============ BOOK OPERATIONS ============
  const addBook = useCallback(async (book: Omit<Book, 'id' | 'createdAt' | 'availableCopies'>) => {
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
      availableCopies: book.quantity,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await booksApi.create({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          categoryId: book.categoryId,
          quantity: book.quantity,
          coverUrl: book.coverUrl,
        });
        newBook.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, books: [...prev.books, newBook] }));
    return newBook;
  }, [isApiMode]);

  const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
    if (isApiMode) {
      try {
        await booksApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  }, [isApiMode]);

  const deleteBook = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await booksApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      books: prev.books.filter(b => b.id !== id),
    }));
  }, [isApiMode]);

  // ============ CATEGORY OPERATIONS ============
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };

    if (isApiMode) {
      try {
        const result = await categoriesApi.create({
          name: category.name,
          color: category.color,
        });
        newCategory.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, categories: [...prev.categories, newCategory] }));
    return newCategory;
  }, [isApiMode]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    if (isApiMode) {
      try {
        await categoriesApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, [isApiMode]);

  const deleteCategory = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await categoriesApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
    }));
  }, [isApiMode]);

  // ============ CLASS OPERATIONS ============
  const addClass = useCallback(async (classData: Omit<SchoolClass, 'id' | 'createdAt'>) => {
    const newClass: SchoolClass = {
      ...classData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await classesApi.create({
          name: classData.name,
          ageRange: classData.ageRange,
          monitorName: classData.monitorName,
        });
        newClass.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, classes: [...prev.classes, newClass] }));
    return newClass;
  }, [isApiMode]);

  const updateClass = useCallback(async (id: string, updates: Partial<SchoolClass>) => {
    if (isApiMode) {
      try {
        await classesApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, [isApiMode]);

  const deleteClass = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await classesApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== id),
    }));
  }, [isApiMode]);

  // ============ PARTICIPANT OPERATIONS ============
  const getNextParticipantNumber = useCallback((cdejNumber: string): string => {
    const existing = data.participants
      .filter(p => p.participantNumber)
      .map(p => {
        const parts = p.participantNumber.split('-');
        return parseInt(parts[parts.length - 1] || '0');
      });
    const max = Math.max(0, ...existing);
    const next = (max + 1).toString().padStart(5, '0');
    const prefix = cdejNumber.startsWith('HA-') ? cdejNumber : `HA-${cdejNumber}`;
    return `${prefix}-${next}`;
  }, [data.participants]);

  const addParticipant = useCallback(async (participantData: Omit<Participant, 'id' | 'createdAt' | 'participantNumber' | 'ageRange'>) => {
    const cdejNumber = localStorage.getItem('bibliosystem_config') 
      ? JSON.parse(localStorage.getItem('bibliosystem_config') || '{}').cdejNumber || '0000' 
      : '0000';
    
    const newParticipant: Participant = {
      ...participantData,
      id: Date.now().toString(),
      participantNumber: getNextParticipantNumber(cdejNumber),
      ageRange: getAgeRangeFromAge(participantData.age),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await participantsApi.create({
          firstName: participantData.firstName,
          lastName: participantData.lastName,
          age: participantData.age,
          classId: participantData.classId,
          gender: participantData.gender,
        });
        newParticipant.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, participants: [...prev.participants, newParticipant] }));
    return newParticipant;
  }, [isApiMode, getNextParticipantNumber]);

  const updateParticipant = useCallback(async (id: string, updates: Partial<Participant>) => {
    if (isApiMode) {
      try {
        await participantsApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          if (updates.age !== undefined) {
            updated.ageRange = getAgeRangeFromAge(updates.age);
          }
          return updated;
        }
        return p;
      }),
    }));
  }, [isApiMode]);

  const deleteParticipant = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await participantsApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id),
    }));
  }, [isApiMode]);

  // ============ LOAN OPERATIONS ============
  const addLoan = useCallback(async (loanData: Omit<Loan, 'id' | 'loanDate' | 'returnDate' | 'status' | 'borrowerName'>) => {
    let borrowerName = '';
    if (loanData.borrowerType === 'participant') {
      const p = data.participants.find(p => p.id === loanData.borrowerId);
      borrowerName = p ? `${p.firstName} ${p.lastName}` : 'Inconnu';
    } else {
      const r = data.otherReaders.find(r => r.id === loanData.borrowerId);
      borrowerName = r ? `${r.firstName} ${r.lastName}` : 'Inconnu';
    }

    const newLoan: Loan = {
      ...loanData,
      id: Date.now().toString(),
      borrowerName,
      participantId: loanData.borrowerType === 'participant' ? loanData.borrowerId : undefined,
      participantName: loanData.borrowerType === 'participant' ? borrowerName : undefined,
      loanDate: new Date().toISOString().split('T')[0],
      returnDate: null,
      status: 'active',
    };

    if (isApiMode) {
      try {
        const result = await loansApi.create({
          bookId: loanData.bookId,
          borrowerType: loanData.borrowerType,
          borrowerId: loanData.borrowerId,
          dueDate: loanData.dueDate,
        });
        newLoan.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({
      ...prev,
      loans: [...prev.loans, newLoan],
      books: prev.books.map(b =>
        b.id === loanData.bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b
      ),
    }));
    return newLoan;
  }, [isApiMode, data.participants, data.otherReaders]);

  const returnLoan = useCallback(async (id: string) => {
    const loan = data.loans.find(l => l.id === id);
    if (!loan) return;

    if (isApiMode) {
      try {
        await loansApi.return(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({
      ...prev,
      loans: prev.loans.map(l =>
        l.id === id ? { ...l, status: 'returned', returnDate: new Date().toISOString().split('T')[0] } : l
      ),
      books: prev.books.map(b =>
        b.id === loan.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b
      ),
    }));
  }, [isApiMode, data.loans]);

  const renewLoan = useCallback(async (id: string, newDueDate: string) => {
    if (isApiMode) {
      try {
        await loansApi.renew(id, newDueDate);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      loans: prev.loans.map(l =>
        l.id === id ? { ...l, dueDate: newDueDate, status: 'active' } : l
      ),
    }));
  }, [isApiMode]);

  const deleteLoan = useCallback(async (id: string) => {
    const loan = data.loans.find(l => l.id === id);
    
    if (isApiMode) {
      try {
        await loansApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    if (loan && (loan.status === 'active' || loan.status === 'overdue')) {
      setData(prev => ({
        ...prev,
        loans: prev.loans.filter(l => l.id !== id),
        books: prev.books.map(b =>
          b.id === loan.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b
        ),
      }));
    } else {
      setData(prev => ({
        ...prev,
        loans: prev.loans.filter(l => l.id !== id),
      }));
    }
  }, [isApiMode, data.loans]);

  // ============ TASK OPERATIONS ============
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      completedAt: null,
    };

    if (isApiMode) {
      try {
        const result = await tasksApi.create({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate || undefined,
        });
        newTask.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    return newTask;
  }, [isApiMode]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (isApiMode) {
      try {
        await tasksApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
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
  }, [isApiMode]);

  const deleteTask = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await tasksApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  }, [isApiMode]);

  const toggleTaskStatus = useCallback((id: string) => {
    const task = data.tasks.find(t => t.id === id);
    if (task) {
      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      updateTask(id, { status: newStatus });
    }
  }, [data.tasks, updateTask]);

  // ============ USER PROFILE OPERATIONS ============
  const addUserProfile = useCallback((profile: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const newProfile: UserProfile = {
      ...profile,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, userProfiles: [...prev.userProfiles, newProfile] }));
    return newProfile;
  }, []);

  const updateUserProfile = useCallback((id: string, updates: Partial<UserProfile>) => {
    setData(prev => ({
      ...prev,
      userProfiles: prev.userProfiles.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const deleteUserProfile = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      userProfiles: prev.userProfiles.filter(p => p.id !== id),
    }));
  }, []);

  // ============ EXTRA ACTIVITY TYPE OPERATIONS ============
  const addExtraActivityType = useCallback(async (type: Omit<ExtraActivityType, 'id' | 'createdAt'>) => {
    const newType: ExtraActivityType = {
      ...type,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await extraActivitiesApi.createType(type);
        newType.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, extraActivityTypes: [...prev.extraActivityTypes, newType] }));
    return newType;
  }, [isApiMode]);

  const updateExtraActivityType = useCallback(async (id: string, updates: Partial<ExtraActivityType>) => {
    if (isApiMode) {
      try {
        await extraActivitiesApi.updateType(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      extraActivityTypes: prev.extraActivityTypes.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, [isApiMode]);

  const deleteExtraActivityType = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await extraActivitiesApi.deleteType(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      extraActivityTypes: prev.extraActivityTypes.filter(t => t.id !== id),
    }));
  }, [isApiMode]);

  // ============ EXTRA ACTIVITY OPERATIONS ============
  const addExtraActivity = useCallback(async (activity: Omit<ExtraActivity, 'id' | 'createdAt'>) => {
    const newActivity: ExtraActivity = {
      ...activity,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await extraActivitiesApi.create(activity);
        newActivity.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, extraActivities: [...prev.extraActivities, newActivity] }));
    return newActivity;
  }, [isApiMode]);

  const updateExtraActivity = useCallback(async (id: string, updates: Partial<ExtraActivity>) => {
    if (isApiMode) {
      try {
        await extraActivitiesApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      extraActivities: prev.extraActivities.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  }, [isApiMode]);

  const deleteExtraActivity = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await extraActivitiesApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      extraActivities: prev.extraActivities.filter(a => a.id !== id),
    }));
  }, [isApiMode]);

  // ============ BOOK RESUME OPERATIONS ============
  const addBookResume = useCallback(async (resume: Omit<BookResume, 'id' | 'createdAt'>) => {
    const newResume: BookResume = {
      ...resume,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await bookResumesApi.create(resume);
        newResume.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, bookResumes: [...prev.bookResumes, newResume] }));
    return newResume;
  }, [isApiMode]);

  const updateBookResume = useCallback(async (id: string, updates: Partial<BookResume>) => {
    if (isApiMode) {
      try {
        await bookResumesApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      bookResumes: prev.bookResumes.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  }, [isApiMode]);

  const deleteBookResume = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await bookResumesApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      bookResumes: prev.bookResumes.filter(r => r.id !== id),
    }));
  }, [isApiMode]);

  // ============ READING SESSION OPERATIONS ============
  const addReadingSession = useCallback(async (session: Omit<ReadingSession, 'id' | 'createdAt'>) => {
    const newSession: ReadingSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await readingSessionsApi.create(session);
        newSession.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, readingSessions: [...prev.readingSessions, newSession] }));
    return newSession;
  }, [isApiMode]);

  const updateReadingSession = useCallback(async (id: string, updates: Partial<ReadingSession>) => {
    if (isApiMode) {
      try {
        await readingSessionsApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      readingSessions: prev.readingSessions.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, [isApiMode]);

  const deleteReadingSession = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await readingSessionsApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      readingSessions: prev.readingSessions.filter(s => s.id !== id),
    }));
  }, [isApiMode]);

  // ============ CLASS READING SESSION OPERATIONS ============
  const addClassReadingSession = useCallback(async (session: Omit<ClassReadingSession, 'id' | 'createdAt'>) => {
    const newSession: ClassReadingSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await readingSessionsApi.createClassSession(session);
        newSession.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, classReadingSessions: [...prev.classReadingSessions, newSession] }));
    return newSession;
  }, [isApiMode]);

  const updateClassReadingSession = useCallback(async (id: string, updates: Partial<ClassReadingSession>) => {
    // API mode not fully supported for class session updates - use local storage
    void updates;
    setData(prev => ({
      ...prev,
      classReadingSessions: prev.classReadingSessions.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, [isApiMode]);

  const deleteClassReadingSession = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await readingSessionsApi.deleteClassSession(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      classReadingSessions: prev.classReadingSessions.filter(s => s.id !== id),
      readingSessions: prev.readingSessions.filter(s => s.classSessionId !== id),
    }));
  }, [isApiMode]);

  const addBulkClassSession = useCallback((classId: string, sessionDate: string, attendeeCount: number, notes?: string) => {
    return addClassReadingSession({
      classId,
      sessionDate,
      attendeeCount,
      sessionType: 'bulk',
      notes,
    });
  }, [addClassReadingSession]);

  const addDetailedClassSession = useCallback((
    classId: string,
    sessionDate: string,
    participantSessions: { participantId: string; bookId: string; readingType: ReadingType }[],
    notes?: string
  ) => {
    const classSession = addClassReadingSession({
      classId,
      sessionDate,
      attendeeCount: participantSessions.length,
      sessionType: 'detailed',
      notes,
    });

    participantSessions.forEach((ps, index) => {
      const newSession: ReadingSession = {
        id: `${Date.now()}_${index}`,
        participantId: ps.participantId,
        bookId: ps.bookId,
        sessionDate,
        readingType: ps.readingType,
        classSessionId: (classSession as any).id,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setData(prev => ({ ...prev, readingSessions: [...prev.readingSessions, newSession] }));
    });

    return classSession;
  }, [addClassReadingSession]);

  // ============ MATERIAL OPERATIONS ============
  const addMaterialType = useCallback(async (type: Omit<MaterialType, 'id' | 'createdAt'>) => {
    const newType: MaterialType = {
      ...type,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await materialsApi.createType(type);
        newType.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, materialTypes: [...prev.materialTypes, newType] }));
    return newType;
  }, [isApiMode]);

  const updateMaterialType = useCallback(async (id: string, updates: Partial<MaterialType>) => {
    if (isApiMode) {
      try {
        await materialsApi.updateType(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      materialTypes: prev.materialTypes.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, [isApiMode]);

  const deleteMaterialType = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await materialsApi.deleteType(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      materialTypes: prev.materialTypes.filter(t => t.id !== id),
    }));
  }, [isApiMode]);

  const addMaterial = useCallback(async (material: Omit<Material, 'id' | 'createdAt' | 'availableQuantity'>) => {
    const newMaterial: Material = {
      ...material,
      id: Date.now().toString(),
      availableQuantity: material.quantity,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await materialsApi.create(material);
        newMaterial.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, materials: [...prev.materials, newMaterial] }));
    return newMaterial;
  }, [isApiMode]);

  const updateMaterial = useCallback(async (id: string, updates: Partial<Material>) => {
    if (isApiMode) {
      try {
        await materialsApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      materials: prev.materials.map(m => m.id === id ? { ...m, ...updates } : m),
    }));
  }, [isApiMode]);

  const deleteMaterial = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await materialsApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== id),
    }));
  }, [isApiMode]);

  // ============ ENTITY OPERATIONS ============
  const addEntity = useCallback(async (entity: Omit<Entity, 'id' | 'createdAt'>) => {
    const newEntity: Entity = {
      ...entity,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await materialsApi.createEntity(entity);
        newEntity.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, entities: [...prev.entities, newEntity] }));
    return newEntity;
  }, [isApiMode]);

  const updateEntity = useCallback(async (id: string, updates: Partial<Entity>) => {
    if (isApiMode) {
      try {
        await materialsApi.updateEntity(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      entities: prev.entities.map(e => e.id === id ? { ...e, ...updates } : e),
    }));
  }, [isApiMode]);

  const deleteEntity = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await materialsApi.deleteEntity(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      entities: prev.entities.filter(e => e.id !== id),
    }));
  }, [isApiMode]);

  // ============ MATERIAL LOAN OPERATIONS ============
  const addMaterialLoan = useCallback(async (loan: Omit<MaterialLoan, 'id' | 'createdAt' | 'loanDate' | 'status' | 'borrowerName'>) => {
    let borrowerName = '';
    if (loan.borrowerType === 'participant') {
      const p = data.participants.find(p => p.id === loan.borrowerId);
      borrowerName = p ? `${p.firstName} ${p.lastName}` : 'Inconnu';
    } else {
      const e = data.entities.find(e => e.id === loan.borrowerId);
      borrowerName = e?.name || 'Inconnu';
    }

    const newLoan: MaterialLoan = {
      ...loan,
      id: Date.now().toString(),
      borrowerName,
      loanDate: new Date().toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await materialsApi.createLoan(loan);
        newLoan.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({
      ...prev,
      materialLoans: [...prev.materialLoans, newLoan],
      materials: prev.materials.map(m =>
        m.id === loan.materialId ? { ...m, availableQuantity: m.availableQuantity - loan.quantity } : m
      ),
    }));
    return newLoan;
  }, [isApiMode, data.participants, data.entities]);

  const returnMaterialLoan = useCallback(async (id: string) => {
    const loan = data.materialLoans.find(l => l.id === id);
    if (!loan) return;

    if (isApiMode) {
      try {
        await materialsApi.returnLoan(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({
      ...prev,
      materialLoans: prev.materialLoans.map(l =>
        l.id === id ? { ...l, status: 'returned', returnDate: new Date().toISOString().split('T')[0] } : l
      ),
      materials: prev.materials.map(m =>
        m.id === loan.materialId ? { ...m, availableQuantity: m.availableQuantity + loan.quantity } : m
      ),
    }));
  }, [isApiMode, data.materialLoans]);

  const renewMaterialLoan = useCallback(async (id: string, newDueDate: string) => {
    if (isApiMode) {
      try {
        await materialsApi.renewLoan(id, newDueDate);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      materialLoans: prev.materialLoans.map(l =>
        l.id === id ? { ...l, dueDate: newDueDate, status: 'active' } : l
      ),
    }));
  }, [isApiMode]);

  // ============ OTHER READER OPERATIONS ============
  const getNextOtherReaderNumber = useCallback((): string => {
    const existing = data.otherReaders
      .filter(r => r.readerNumber)
      .map(r => {
        const parts = r.readerNumber.split('-');
        return parseInt(parts[parts.length - 1] || '0');
      });
    const max = Math.max(0, ...existing);
    const next = (max + 1).toString().padStart(5, '0');
    return `HA-0000-L-${next}`;
  }, [data.otherReaders]);

  const addOtherReader = useCallback(async (reader: Omit<OtherReader, 'id' | 'createdAt' | 'readerNumber'>) => {
    const newReader: OtherReader = {
      ...reader,
      id: Date.now().toString(),
      readerNumber: getNextOtherReaderNumber(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await otherReadersApi.create(reader);
        newReader.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, otherReaders: [...prev.otherReaders, newReader] }));
    return newReader;
  }, [isApiMode, getNextOtherReaderNumber]);

  const updateOtherReader = useCallback(async (id: string, updates: Partial<OtherReader>) => {
    if (isApiMode) {
      try {
        await otherReadersApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      otherReaders: prev.otherReaders.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  }, [isApiMode]);

  const deleteOtherReader = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await otherReadersApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      otherReaders: prev.otherReaders.filter(r => r.id !== id),
    }));
  }, [isApiMode]);

  // ============ BOOK ISSUE OPERATIONS ============
  const addBookIssue = useCallback(async (issue: Omit<BookIssue, 'id' | 'createdAt'>) => {
    const newIssue: BookIssue = {
      ...issue,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await bookIssuesApi.create(issue);
        newIssue.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, bookIssues: [...prev.bookIssues, newIssue] }));
    return newIssue;
  }, [isApiMode]);

  const updateBookIssue = useCallback(async (id: string, updates: Partial<BookIssue>) => {
    if (isApiMode) {
      try {
        await bookIssuesApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      bookIssues: prev.bookIssues.map(i => i.id === id ? { ...i, ...updates } : i),
    }));
  }, [isApiMode]);

  const deleteBookIssue = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await bookIssuesApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      bookIssues: prev.bookIssues.filter(i => i.id !== id),
    }));
  }, [isApiMode]);

  const resolveBookIssue = useCallback(async (id: string, status: 'resolved' | 'written_off', resolution: string) => {
    if (isApiMode) {
      try {
        await bookIssuesApi.update(id, { status, resolution, resolvedAt: new Date().toISOString().split('T')[0] });
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      bookIssues: prev.bookIssues.map(i => i.id === id ? {
        ...i,
        status,
        resolution,
        resolvedAt: new Date().toISOString().split('T')[0],
      } : i),
    }));
  }, [isApiMode]);

  // ============ INVENTORY OPERATIONS ============
  const createInventorySession = useCallback(async (name: string, type: InventoryType, notes?: string): Promise<InventorySession> => {
    const existingActive = data.inventorySessions.find(s => s.status === 'in_progress');
    if (existingActive) {
      throw new Error('Un inventaire est déjà en cours');
    }

    const sessionId = Date.now().toString();
    const today = new Date().toISOString().split('T')[0];

    const newSession: InventorySession = {
      id: sessionId,
      name,
      type,
      status: 'in_progress',
      startDate: today,
      totalBooks: data.books.length,
      checkedBooks: 0,
      foundBooks: 0,
      missingBooks: 0,
      notes,
      createdAt: today,
    };

    const newItems: InventoryItem[] = data.books.map((book, index) => ({
      id: `${sessionId}_${index}`,
      inventorySessionId: sessionId,
      bookId: book.id,
      expectedQuantity: book.quantity,
      status: 'pending' as InventoryItemStatus,
    }));

    if (isApiMode) {
      try {
        const result = await inventoryApi.createSession({ name });
        newSession.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({
      ...prev,
      inventorySessions: [...prev.inventorySessions, newSession],
      inventoryItems: [...prev.inventoryItems, ...newItems],
    }));

    return newSession;
  }, [isApiMode, data.inventorySessions, data.books]);

  const updateInventoryItem = useCallback(async (itemId: string, foundQuantity: number, notes?: string) => {
    // Inventory item updates use local storage - API has different structure
    void notes;

    setData(prev => {
      const item = prev.inventoryItems.find(i => i.id === itemId);
      if (!item) return prev;

      const status: InventoryItemStatus = foundQuantity === item.expectedQuantity ? 'checked' : 'discrepancy';
      const today = new Date().toISOString().split('T')[0];

      const updatedItems = prev.inventoryItems.map(i =>
        i.id === itemId ? { ...i, foundQuantity, status, checkedAt: today, notes } : i
      );

      const sessionItems = updatedItems.filter(i => i.inventorySessionId === item.inventorySessionId);
      const checkedBooks = sessionItems.filter(i => i.status !== 'pending').length;
      const foundBooks = sessionItems.reduce((sum, i) => sum + (i.foundQuantity || 0), 0);
      const expectedTotal = sessionItems.reduce((sum, i) => sum + i.expectedQuantity, 0);
      const missingBooks = expectedTotal - foundBooks;

      const updatedSessions = prev.inventorySessions.map(s =>
        s.id === item.inventorySessionId ? { ...s, checkedBooks, foundBooks, missingBooks } : s
      );

      return { ...prev, inventoryItems: updatedItems, inventorySessions: updatedSessions };
    });
  }, [isApiMode]);

  const batchUpdateInventoryItems = useCallback(async (itemIds: string[], markAsExpected: boolean = true) => {
    // Batch updates use local storage - API has different structure
    void markAsExpected;

    setData(prev => {
      const today = new Date().toISOString().split('T')[0];
      let sessionId: string | null = null;

      const updatedItems = prev.inventoryItems.map(item => {
        if (!itemIds.includes(item.id)) return item;

        sessionId = item.inventorySessionId;
        const foundQuantity = markAsExpected ? item.expectedQuantity : 0;
        const status: InventoryItemStatus = foundQuantity === item.expectedQuantity ? 'checked' : 'discrepancy';

        return { ...item, foundQuantity, status, checkedAt: today };
      });

      if (!sessionId) return prev;

      const sessionItems = updatedItems.filter(i => i.inventorySessionId === sessionId);
      const checkedBooks = sessionItems.filter(i => i.status !== 'pending').length;
      const foundBooks = sessionItems.reduce((sum, i) => sum + (i.foundQuantity || 0), 0);
      const expectedTotal = sessionItems.reduce((sum, i) => sum + i.expectedQuantity, 0);
      const missingBooks = expectedTotal - foundBooks;

      const updatedSessions = prev.inventorySessions.map(s =>
        s.id === sessionId ? { ...s, checkedBooks, foundBooks, missingBooks } : s
      );

      return { ...prev, inventoryItems: updatedItems, inventorySessions: updatedSessions };
    });
  }, [isApiMode]);

  const completeInventorySession = useCallback(async (sessionId: string) => {
    if (isApiMode) {
      try {
        await inventoryApi.completeSession(sessionId);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    const today = new Date().toISOString().split('T')[0];
    setData(prev => ({
      ...prev,
      inventorySessions: prev.inventorySessions.map(s =>
        s.id === sessionId ? { ...s, status: 'completed' as InventoryStatus, endDate: today } : s
      ),
    }));
  }, [isApiMode]);

  const cancelInventorySession = useCallback(async (sessionId: string) => {
    // Cancel uses local storage only
    void sessionId;
    const today = new Date().toISOString().split('T')[0];
    setData(prev => ({
      ...prev,
      inventorySessions: prev.inventorySessions.map(s =>
        s.id === sessionId ? { ...s, status: 'cancelled' as InventoryStatus, endDate: today } : s
      ),
    }));
  }, [isApiMode]);

  const deleteInventorySession = useCallback(async (sessionId: string) => {
    if (isApiMode) {
      try {
        await inventoryApi.deleteSession(sessionId);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      inventorySessions: prev.inventorySessions.filter(s => s.id !== sessionId),
      inventoryItems: prev.inventoryItems.filter(i => i.inventorySessionId !== sessionId),
    }));
  }, [isApiMode]);

  // ============ FEEDBACK OPERATIONS ============
  const addFeedback = useCallback((feedback: Omit<Feedback, 'id' | 'createdAt'>) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: Date.now().toString(),
      status: feedback.status as 'pending' | 'sent' | 'reviewed',
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, feedbacks: [...prev.feedbacks, newFeedback] }));
    return newFeedback;
  }, []);

  const updateFeedback = useCallback((id: string, updates: Partial<Feedback>) => {
    setData(prev => ({
      ...prev,
      feedbacks: prev.feedbacks.map(f => f.id === id ? { ...f, ...updates } : f),
    }));
  }, []);

  const deleteFeedback = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      feedbacks: prev.feedbacks.filter(f => f.id !== id),
    }));
  }, []);

  // ============ NOTIFICATION OPERATIONS ============
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, notifications: [newNotification, ...prev.notifications] }));
    return newNotification;
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setData(prev => ({ ...prev, notifications: [] }));
  }, []);

  const getUnreadNotificationsCount = useCallback(() => {
    return data.notifications.filter(n => !n.read).length;
  }, [data.notifications]);

  const generateSystemNotifications = useCallback(() => {
    const now = new Date();
    const newNotifications: Omit<Notification, 'id' | 'createdAt' | 'read'>[] = [];

    const overdueLoans = data.loans.filter(l =>
      l.status === 'active' && new Date(l.dueDate) < now
    );
    if (overdueLoans.length > 0) {
      newNotifications.push({
        type: 'overdue_loan',
        title: `${overdueLoans.length} prêt(s) en retard`,
        message: 'Des livres n\'ont pas été retournés à temps.',
        link: '/loans',
      });
    }

    const tasksDueSoon = data.tasks.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      const diffDays = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 2;
    });
    tasksDueSoon.forEach(task => {
      newNotifications.push({
        type: 'task',
        title: `Tâche à venir: ${task.title}`,
        message: `Échéance: ${new Date(task.dueDate!).toLocaleDateString('fr-FR')}`,
        link: '/tasks',
      });
    });

    const openIssues = data.bookIssues.filter(i => i.status === 'open');
    if (openIssues.length > 0) {
      newNotifications.push({
        type: 'book_issue',
        title: `${openIssues.length} problème(s) de livre non résolu(s)`,
        message: 'Des livres nécessitent votre attention.',
        link: '/book-issues',
      });
    }

    const activeInventory = data.inventorySessions.find(s => s.status === 'in_progress');
    if (activeInventory) {
      newNotifications.push({
        type: 'inventory',
        title: 'Inventaire en cours',
        message: `${activeInventory.name} - ${activeInventory.checkedBooks}/${activeInventory.totalBooks} vérifiés`,
        link: '/inventory',
      });
    }

    return newNotifications;
  }, [data.loans, data.tasks, data.bookIssues, data.inventorySessions]);

  // ============ GETTERS ============
  const getCategoryById = useCallback((id: string) => data.categories.find(c => c.id === id), [data.categories]);
  const getBookById = useCallback((id: string) => data.books.find(b => b.id === id), [data.books]);
  const getClassById = useCallback((id: string) => data.classes.find(c => c.id === id), [data.classes]);
  const getParticipantById = useCallback((id: string) => data.participants.find(p => p.id === id), [data.participants]);
  const getParticipantsByClass = useCallback((classId: string) => data.participants.filter(p => p.classId === classId), [data.participants]);
  const getUserProfileById = useCallback((id: string) => data.userProfiles.find(p => p.id === id), [data.userProfiles]);
  const getTaskById = useCallback((id: string) => data.tasks.find(t => t.id === id), [data.tasks]);
  const getExtraActivityTypeById = useCallback((id: string) => data.extraActivityTypes.find(t => t.id === id), [data.extraActivityTypes]);
  const getExtraActivityById = useCallback((id: string) => data.extraActivities.find(a => a.id === id), [data.extraActivities]);
  const getBookResumeById = useCallback((id: string) => data.bookResumes.find(r => r.id === id), [data.bookResumes]);
  const getReadingSessionById = useCallback((id: string) => data.readingSessions.find(s => s.id === id), [data.readingSessions]);
  const getReadingSessionsByParticipant = useCallback((participantId: string) => data.readingSessions.filter(s => s.participantId === participantId), [data.readingSessions]);
  const getReadingSessionsByBook = useCallback((bookId: string) => data.readingSessions.filter(s => s.bookId === bookId), [data.readingSessions]);
  const getClassReadingSessionById = useCallback((id: string) => data.classReadingSessions.find(s => s.id === id), [data.classReadingSessions]);
  const getClassReadingSessionsByClass = useCallback((classId: string) => data.classReadingSessions.filter(s => s.classId === classId), [data.classReadingSessions]);
  const getLoanById = useCallback((id: string) => data.loans.find(l => l.id === id), [data.loans]);
  const getActiveLoansForParticipant = useCallback((participantId: string) =>
    data.loans.filter(l => l.participantId === participantId && (l.status === 'active' || l.status === 'overdue')), [data.loans]);
  const getOverdueLoans = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return data.loans.filter(l => l.status !== 'returned' && l.dueDate < today);
  }, [data.loans]);
  const getReturnedLoans = useCallback(() => data.loans.filter(l => l.status === 'returned'), [data.loans]);
  const canParticipantBorrow = useCallback((participantId: string) =>
    getActiveLoansForParticipant(participantId).length < 3, [getActiveLoansForParticipant]);
  const getMaterialTypeById = useCallback((id: string) => data.materialTypes.find(t => t.id === id), [data.materialTypes]);
  const getMaterialById = useCallback((id: string) => data.materials.find(m => m.id === id), [data.materials]);
  const getEntityById = useCallback((id: string) => data.entities.find(e => e.id === id), [data.entities]);
  const getOtherReaderById = useCallback((id: string) => data.otherReaders.find(r => r.id === id), [data.otherReaders]);
  const getActiveLoansForOtherReader = useCallback((readerId: string) =>
    data.loans.filter(l => l.borrowerType === 'other_reader' && l.borrowerId === readerId && (l.status === 'active' || l.status === 'overdue')), [data.loans]);
  const canOtherReaderBorrow = useCallback((readerId: string) =>
    getActiveLoansForOtherReader(readerId).length < 3, [getActiveLoansForOtherReader]);
  const getBookIssueById = useCallback((id: string) => data.bookIssues.find(i => i.id === id), [data.bookIssues]);
  const getBookIssuesByBook = useCallback((bookId: string) => data.bookIssues.filter(i => i.bookId === bookId), [data.bookIssues]);
  const getOpenBookIssues = useCallback(() => data.bookIssues.filter(i => i.status === 'open'), [data.bookIssues]);
  const getActiveInventory = useCallback(() => data.inventorySessions.find(s => s.status === 'in_progress'), [data.inventorySessions]);
  const getInventoryHistory = useCallback(() =>
    data.inventorySessions.filter(s => s.status !== 'in_progress').sort((a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    ), [data.inventorySessions]);
  const getInventoryItems = useCallback((sessionId: string) =>
    data.inventoryItems.filter(i => i.inventorySessionId === sessionId), [data.inventoryItems]);

  // ============ STATS ============
  const getStats = useCallback(() => {
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
  }, [data.books, data.loans, data.participants]);

  const getTaskStats = useCallback(() => {
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
  }, [data.tasks]);

  const getRecentActivity = useCallback(() => {
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
  }, [data.loans, getBookById]);

  const getUpcomingTasks = useCallback((limit = 5) => {
    return [...data.tasks]
      .filter(t => t.status !== 'completed')
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, limit);
  }, [data.tasks]);

  const getLoanStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7);

    const activeLoans = data.loans.filter(l => l.status === 'active' || l.status === 'overdue').length;
    const overdueLoans = data.loans.filter(l => l.status !== 'returned' && l.dueDate < today).length;
    const returnsThisMonth = data.loans.filter(l => l.status === 'returned' && l.returnDate?.startsWith(thisMonth)).length;

    const participantCounts: Record<string, number> = {};
    data.loans.filter(l => l.status === 'active' || l.status === 'overdue').forEach(l => {
      if (l.participantId) {
        participantCounts[l.participantId] = (participantCounts[l.participantId] || 0) + 1;
      }
    });
    const mostActiveParticipantId = Object.entries(participantCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostActiveParticipant = mostActiveParticipantId ? getParticipantById(mostActiveParticipantId) : null;

    return { activeLoans, overdueLoans, returnsThisMonth, mostActiveParticipant };
  }, [data.loans, getParticipantById]);

  const getMaterialLoanStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7);
    return {
      activeLoans: data.materialLoans.filter(l => l.status === 'active' || (l.status !== 'returned' && l.dueDate >= today)).length,
      overdueLoans: data.materialLoans.filter(l => l.status !== 'returned' && l.dueDate < today).length,
      returnsThisMonth: data.materialLoans.filter(l => l.status === 'returned' && l.returnDate?.startsWith(thisMonth)).length,
    };
  }, [data.materialLoans]);

  const getBookIssueStats = useCallback(() => {
    return {
      total: data.bookIssues.length,
      open: data.bookIssues.filter(i => i.status === 'open').length,
      resolved: data.bookIssues.filter(i => i.status === 'resolved').length,
      writtenOff: data.bookIssues.filter(i => i.status === 'written_off').length,
      byType: {
        not_returned: data.bookIssues.filter(i => i.issueType === 'not_returned').length,
        damaged: data.bookIssues.filter(i => i.issueType === 'damaged').length,
        torn: data.bookIssues.filter(i => i.issueType === 'torn').length,
        lost: data.bookIssues.filter(i => i.issueType === 'lost').length,
        other: data.bookIssues.filter(i => i.issueType === 'other').length,
      },
    };
  }, [data.bookIssues]);

  const getInventoryStats = useCallback((sessionId: string) => {
    const session = data.inventorySessions.find(s => s.id === sessionId);
    const items = data.inventoryItems.filter(i => i.inventorySessionId === sessionId);

    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      checked: items.filter(i => i.status === 'checked').length,
      discrepancy: items.filter(i => i.status === 'discrepancy').length,
      progress: items.length > 0 ? Math.round((items.filter(i => i.status !== 'pending').length / items.length) * 100) : 0,
      foundBooks: session?.foundBooks || 0,
      missingBooks: session?.missingBooks || 0,
    };
  }, [data.inventorySessions, data.inventoryItems]);

  const getDataStats = useCallback(() => {
    const storedData = localStorage.getItem(STORAGE_KEY) || '';
    const sizeInBytes = new Blob([storedData]).size;
    const sizeInKB = Math.round(sizeInBytes / 1024 * 10) / 10;

    return {
      sizeInKB,
      counts: {
        books: data.books.length,
        categories: data.categories.length,
        participants: data.participants.length,
        classes: data.classes.length,
        loans: data.loans.length,
        readingSessions: data.readingSessions.length,
        classReadingSessions: data.classReadingSessions.length,
        tasks: data.tasks.length,
        bookResumes: data.bookResumes.length,
        extraActivities: data.extraActivities.length,
        extraActivityTypes: data.extraActivityTypes.length,
        userProfiles: data.userProfiles.length,
      },
      totalItems:
        data.books.length +
        data.categories.length +
        data.participants.length +
        data.classes.length +
        data.loans.length +
        data.readingSessions.length +
        data.classReadingSessions.length +
        data.tasks.length +
        data.bookResumes.length +
        data.extraActivities.length +
        data.extraActivityTypes.length +
        data.userProfiles.length,
    };
  }, [data]);

  return {
    // Data
    ...data,
    isApiMode,
    isLoading,
    refreshFromApi,
    
    // Book operations
    addBook, updateBook, deleteBook,
    
    // Category operations
    addCategory, updateCategory, deleteCategory,
    
    // Class operations
    addClass, updateClass, deleteClass,
    
    // Participant operations
    addParticipant, updateParticipant, deleteParticipant, getNextParticipantNumber,
    
    // Loan operations
    addLoan, returnLoan, renewLoan, deleteLoan,
    
    // Task operations
    addTask, updateTask, deleteTask, toggleTaskStatus,
    
    // User profile operations
    addUserProfile, updateUserProfile, deleteUserProfile,
    
    // Extra activity type operations
    addExtraActivityType, updateExtraActivityType, deleteExtraActivityType,
    
    // Extra activity operations
    addExtraActivity, updateExtraActivity, deleteExtraActivity,
    
    // Book resume operations
    addBookResume, updateBookResume, deleteBookResume,
    
    // Reading session operations
    addReadingSession, updateReadingSession, deleteReadingSession,
    
    // Class reading session operations
    addClassReadingSession, updateClassReadingSession, deleteClassReadingSession,
    addBulkClassSession, addDetailedClassSession,
    
    // Material operations
    addMaterialType, updateMaterialType, deleteMaterialType,
    addMaterial, updateMaterial, deleteMaterial,
    addEntity, updateEntity, deleteEntity,
    addMaterialLoan, returnMaterialLoan, renewMaterialLoan,
    
    // Other reader operations
    addOtherReader, updateOtherReader, deleteOtherReader, getNextOtherReaderNumber,
    
    // Book issue operations
    addBookIssue, updateBookIssue, deleteBookIssue, resolveBookIssue,
    
    // Inventory operations
    createInventorySession, updateInventoryItem, batchUpdateInventoryItems,
    completeInventorySession, cancelInventorySession, deleteInventorySession,
    
    // Feedback operations
    addFeedback, updateFeedback, deleteFeedback,
    
    // Notification operations
    addNotification, markNotificationAsRead, markAllNotificationsAsRead,
    deleteNotification, clearAllNotifications, getUnreadNotificationsCount, generateSystemNotifications,
    
    // Getters
    getCategoryById, getBookById, getClassById, getParticipantById, getParticipantsByClass,
    getUserProfileById, getTaskById, getExtraActivityTypeById, getExtraActivityById,
    getBookResumeById, getReadingSessionById, getReadingSessionsByParticipant, getReadingSessionsByBook,
    getClassReadingSessionById, getClassReadingSessionsByClass,
    getLoanById, getActiveLoansForParticipant, getOverdueLoans, getReturnedLoans, canParticipantBorrow,
    getMaterialTypeById, getMaterialById, getEntityById,
    getOtherReaderById, getActiveLoansForOtherReader, canOtherReaderBorrow,
    getBookIssueById, getBookIssuesByBook, getOpenBookIssues,
    getActiveInventory, getInventoryHistory, getInventoryItems,
    
    // Stats
    getStats, getTaskStats, getRecentActivity, getUpcomingTasks, getLoanStats,
    getMaterialLoanStats, getBookIssueStats, getInventoryStats, getDataStats,
  };
}
