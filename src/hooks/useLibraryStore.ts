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
  userProfilesApi,
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
  role: 'admin' | 'staff' | 'volunteer';
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

// Données vides - l'API SQLite est la source de vérité
const emptyData: LibraryData = {
  categories: [],
  books: [],
  classes: [],
  participants: [],
  loans: [],
  tasks: [],
  userProfiles: [],
  extraActivityTypes: [],
  extraActivities: [],
  bookResumes: [],
  readingSessions: [],
  classReadingSessions: [],
  feedbacks: [],
  inventorySessions: [],
  inventoryItems: [],
  materialTypes: [],
  materials: [],
  entities: [],
  materialLoans: [],
  otherReaders: [],
  bookIssues: [],
  notifications: [],
};

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
  // Initialiser avec des tableaux vides - l'API est la source de vérité
  if (!parsed.categories) parsed.categories = [];
  if (!parsed.books) parsed.books = [];
  if (!parsed.classes) parsed.classes = [];
  if (!parsed.participants) parsed.participants = [];
  if (!parsed.loans) parsed.loans = [];
  if (!parsed.tasks) parsed.tasks = [];
  if (!parsed.userProfiles) parsed.userProfiles = [];
  if (!parsed.extraActivityTypes) parsed.extraActivityTypes = [];
  if (!parsed.extraActivities) parsed.extraActivities = [];
  if (!parsed.bookResumes) parsed.bookResumes = [];
  if (!parsed.readingSessions) parsed.readingSessions = [];
  if (!parsed.classReadingSessions) parsed.classReadingSessions = [];
  if (!parsed.feedbacks) parsed.feedbacks = [];
  if (!parsed.inventorySessions) parsed.inventorySessions = [];
  if (!parsed.inventoryItems) parsed.inventoryItems = [];
  if (!parsed.materialTypes) parsed.materialTypes = [];
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
  // Retourner des données vides - l'API SQLite est la source de vérité
  return { ...emptyData };
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
  const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/health`;
  
  try {
    const response = await fetch(apiUrl, {
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
        materialsRes,
        materialTypesRes,
        entitiesRes,
        materialLoansRes,
        otherReadersRes,
        bookIssuesRes,
        readingSessionsRes,
        bookResumesRes,
        extraActivitiesRes,
        extraActivityTypesRes,
        inventorySessionsRes,
        userProfilesRes,
      ] = await Promise.all([
        booksApi.getAll().catch(() => null),
        categoriesApi.getAll().catch(() => null),
        participantsApi.getAll().catch(() => null),
        classesApi.getAll().catch(() => null),
        loansApi.getAll().catch(() => null),
        tasksApi.getAll().catch(() => null),
        materialsApi.getAll().catch(() => null),
        materialsApi.getTypes().catch(() => null),
        materialsApi.getEntities().catch(() => null),
        materialsApi.getLoans().catch(() => null),
        otherReadersApi.getAll().catch(() => null),
        bookIssuesApi.getAll().catch(() => null),
        readingSessionsApi.getAll().catch(() => null),
        bookResumesApi.getAll().catch(() => null),
        extraActivitiesApi.getAll().catch(() => null),
        extraActivitiesApi.getTypes().catch(() => null),
        inventoryApi.getSessions().catch(() => null),
        userProfilesApi.getAll().catch(() => null),
      ]);

      // Helper pour extraire les données (gère les réponses paginées et les tableaux)
      const extractData = (res: any, fallback: any[]) => {
        if (!res) return fallback;
        if (Array.isArray(res)) return res;
        if (res.data && Array.isArray(res.data)) return res.data;
        return fallback;
      };

      setData(prev => ({
        ...prev,
        // Books - handle paginated response
        books: extractData(booksRes, prev.books).map((b: any) => ({
          ...b,
          categoryId: b.categoryId || b.category_id,
          coverUrl: b.coverUrl || b.cover_url || '',
          availableCopies: b.availableCopies ?? b.available_copies ?? b.quantity,
        })),
        categories: extractData(categoriesRes, prev.categories).map((c: any) => ({
          ...c,
          description: c.description || '',
        })),
        participants: extractData(participantsRes, prev.participants).map((p: any) => ({
          ...p,
          participantNumber: p.participantNumber || p.number,
          ageRange: p.ageRange || p.age_range || getAgeRangeFromAge(p.age),
          classId: p.classId || p.class_id,
        })),
        classes: extractData(classesRes, prev.classes).map((c: any) => ({
          ...c,
          ageRange: c.ageRange || c.age_range || '6-8',
          monitorName: c.monitorName || c.monitor_name || '',
        })),
        loans: extractData(loansRes, prev.loans).map((l: any) => ({
          ...l,
          bookId: l.bookId || l.book_id,
          borrowerType: l.borrowerType || l.borrower_type || 'participant',
          borrowerId: l.borrowerId || l.borrower_id,
          borrowerName: l.borrowerName || l.borrower_name,
          participantId: l.participantId || l.borrower_id,
          participantName: l.participantName || l.borrower_name,
          loanDate: l.loanDate || l.loan_date,
          dueDate: l.dueDate || l.due_date,
          returnDate: l.returnDate || l.return_date,
        })),
        tasks: extractData(tasksRes, prev.tasks).map((t: any) => ({
          ...t,
          dueDate: t.dueDate || t.due_date,
          status: t.completed ? 'completed' : (t.status || 'todo'),
          completedAt: t.completedAt || null,
        })),
        materials: extractData(materialsRes, prev.materials).map((m: any) => ({
          ...m,
          materialTypeId: m.materialTypeId || m.type_id || m.typeId,
          serialNumber: m.serialNumber || m.serial_number,
          availableQuantity: m.availableQuantity ?? m.available_quantity ?? m.quantity,
        })),
        materialTypes: extractData(materialTypesRes, prev.materialTypes).map((t: any) => ({
          ...t,
          description: t.description || '',
        })),
        entities: extractData(entitiesRes, prev.entities).map((e: any) => ({
          ...e,
          type: e.type || e.entity_type,
          contactName: e.contactName || e.contact_name,
        })),
        materialLoans: extractData(materialLoansRes, prev.materialLoans).map((l: any) => ({
          ...l,
          materialId: l.materialId || l.material_id,
          borrowerType: l.borrowerType || l.borrower_type,
          borrowerId: l.borrowerId || l.borrower_id,
          borrowerName: l.borrowerName || l.borrower_name,
          loanDate: l.loanDate || l.loan_date,
          dueDate: l.dueDate || l.due_date,
          returnDate: l.returnDate || l.return_date,
        })),
        otherReaders: extractData(otherReadersRes, prev.otherReaders).map((r: any) => ({
          ...r,
          readerNumber: r.readerNumber || r.number,
          readerType: r.readerType || r.reader_type,
        })),
        bookIssues: extractData(bookIssuesRes, prev.bookIssues).map((i: any) => ({
          ...i,
          bookId: i.bookId || i.book_id,
          issueType: i.issueType || i.issue_type,
          loanId: i.loanId || i.loan_id,
          reportDate: i.reportDate || i.report_date,
          borrowerName: i.borrowerName || i.borrower_name,
          resolution: i.resolution || i.resolution_notes,
          resolvedAt: i.resolvedAt || i.resolved_at,
        })),
        readingSessions: extractData(readingSessionsRes, prev.readingSessions).map((s: any) => ({
          ...s,
          participantId: s.participantId || s.participant_id,
          bookId: s.bookId || s.book_id,
          sessionDate: s.sessionDate || s.date,
          readingType: s.readingType || s.reading_type,
          classSessionId: s.classSessionId || s.class_session_id,
        })),
        bookResumes: extractData(bookResumesRes, prev.bookResumes).map((r: any) => ({
          ...r,
          participantNumber: r.participantNumber || r.participant_number,
          bookId: r.bookId || r.book_id,
          summary: r.summary || r.summary_text,
          whatILearned: r.whatILearned || r.learning_notes,
          submittedAt: r.submittedAt || r.submitted_at,
          reviewedAt: r.reviewedAt || r.reviewed_at,
        })),
        extraActivities: extractData(extraActivitiesRes, prev.extraActivities).map((a: any) => ({
          ...a,
          activityTypeId: a.activityTypeId || a.type_id,
        })),
        extraActivityTypes: extractData(extraActivityTypesRes, prev.extraActivityTypes).map((t: any) => ({
          ...t,
          description: t.description || '',
        })),
        inventorySessions: extractData(inventorySessionsRes, prev.inventorySessions).map((s: any) => ({
          ...s,
          type: s.type || s.session_type || 'annual',
          startDate: s.startDate || s.start_date,
          endDate: s.endDate || s.end_date,
          totalBooks: s.totalBooks || s.total_books || 0,
          checkedBooks: s.checkedBooks || s.checked_books || 0,
          foundBooks: s.foundBooks || 0,
          missingBooks: s.missingBooks || s.discrepancy_count || 0,
        })),
        userProfiles: extractData(userProfilesRes, prev.userProfiles).map((p: any) => ({
          ...p,
          avatarUrl: p.avatarUrl || p.avatar_url || '',
          avatarData: p.avatarData || p.avatar_data || '',
          createdAt: p.createdAt || p.created_at,
        })),
      }));
    } catch (error) {
      console.error('Failed to refresh from API:', error);
      // Don't fall back to localStorage - API is required
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
          description: category.description,
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
  const addUserProfile = useCallback(async (profile: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const newProfile: UserProfile = {
      ...profile,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isApiMode) {
      try {
        const result = await userProfilesApi.create({
          name: profile.name,
          email: profile.email,
          role: profile.role,
          phone: profile.phone,
          notes: profile.notes,
          avatarUrl: profile.avatarUrl,
          avatarData: profile.avatarData,
        });
        newProfile.id = result.id;
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }

    setData(prev => ({ ...prev, userProfiles: [...prev.userProfiles, newProfile] }));
    return newProfile;
  }, [isApiMode]);

  const updateUserProfile = useCallback(async (id: string, updates: Partial<UserProfile>) => {
    if (isApiMode) {
      try {
        await userProfilesApi.update(id, updates);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      userProfiles: prev.userProfiles.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, [isApiMode]);

  const deleteUserProfile = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await userProfilesApi.delete(id);
      } catch (error) {
        console.error('API error, using local storage:', error);
      }
    }
    setData(prev => ({
      ...prev,
      userProfiles: prev.userProfiles.filter(p => p.id !== id),
    }));
  }, [isApiMode]);

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
