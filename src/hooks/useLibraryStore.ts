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

export interface Participant {
  id: string;
  name: string;
  pin: string;
  classId: string;
  createdAt: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  teacherName: string;
  year: string;
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
  { id: '1', name: 'Grade 3A', teacherName: 'Mrs. Johnson', year: '2024' },
  { id: '2', name: 'Grade 3B', teacherName: 'Mr. Smith', year: '2024' },
  { id: '3', name: 'Grade 4A', teacherName: 'Mrs. Davis', year: '2024' },
  { id: '4', name: 'Grade 4B', teacherName: 'Mr. Wilson', year: '2024' },
];

const defaultParticipants: Participant[] = [
  { id: '1', name: 'Emma Wilson', pin: '1234', classId: '1', createdAt: '2024-01-05' },
  { id: '2', name: 'Liam Brown', pin: '2345', classId: '1', createdAt: '2024-01-05' },
  { id: '3', name: 'Olivia Garcia', pin: '3456', classId: '2', createdAt: '2024-01-06' },
  { id: '4', name: 'Noah Martinez', pin: '4567', classId: '3', createdAt: '2024-01-07' },
  { id: '5', name: 'Ava Anderson', pin: '5678', classId: '4', createdAt: '2024-01-08' },
];

const defaultLoans: Loan[] = [
  { id: '1', bookId: '1', participantId: '1', participantName: 'Emma Wilson', loanDate: '2024-12-01', dueDate: '2024-12-15', returnDate: null, status: 'active' },
  { id: '2', bookId: '2', participantId: '2', participantName: 'Liam Brown', loanDate: '2024-11-20', dueDate: '2024-12-04', returnDate: null, status: 'overdue' },
  { id: '3', bookId: '6', participantId: '3', participantName: 'Olivia Garcia', loanDate: '2024-12-05', dueDate: '2024-12-19', returnDate: null, status: 'active' },
  { id: '4', bookId: '3', participantId: '4', participantName: 'Noah Martinez', loanDate: '2024-11-15', dueDate: '2024-11-29', returnDate: '2024-11-28', status: 'returned' },
];

interface LibraryData {
  categories: Category[];
  books: Book[];
  classes: SchoolClass[];
  participants: Participant[];
  loans: Loan[];
}

function loadData(): LibraryData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
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

  const getCategoryById = (id: string) => data.categories.find(c => c.id === id);
  const getBookById = (id: string) => data.books.find(b => b.id === id);
  const getParticipantById = (id: string) => data.participants.find(p => p.id === id);

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

  return {
    ...data,
    addBook,
    updateBook,
    deleteBook,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getBookById,
    getParticipantById,
    getStats,
    getRecentActivity,
  };
}
