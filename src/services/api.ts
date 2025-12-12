// API Service Layer for BiblioSystem
// Connects React frontend to Node.js/Express backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Store PINs in memory for session
let adminPin: string | null = null;
let guestPin: string | null = null;

export const setAdminPin = (pin: string) => { adminPin = pin; };
export const setGuestPin = (pin: string) => { guestPin = pin; };
export const clearPins = () => { adminPin = null; guestPin = null; };

// Request helper with authentication headers
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (adminPin) {
    (headers as Record<string, string>)['X-Admin-PIN'] = adminPin;
  } else if (guestPin) {
    (headers as Record<string, string>)['X-Guest-PIN'] = guestPin;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ============ AUTH API ============
export const authApi = {
  verifyAdmin: (pin: string) =>
    request<{ valid: boolean; message: string }>('/auth/verify-admin', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    }),

  verifyGuest: (pin: string) =>
    request<{ valid: boolean; message: string }>('/auth/verify-guest', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    }),

  changePin: (currentPin: string, newPin: string) =>
    request<{ message: string }>('/auth/change-pin', {
      method: 'POST',
      body: JSON.stringify({ currentPin, newPin }),
    }),

  createGuestPin: (expiresAt?: string) =>
    request<{ pin: string; expiresAt: string }>('/auth/guest-pin', {
      method: 'POST',
      body: JSON.stringify({ expiresAt }),
    }),

  getGuestPins: () =>
    request<Array<{ id: string; pin: string; expiresAt: string; used: boolean }>>('/auth/guest-pins'),

  deleteGuestPin: (id: string) =>
    request<void>(`/auth/guest-pins/${id}`, { method: 'DELETE' }),
};

// ============ CONFIG API ============
export const configApi = {
  get: () =>
    request<{
      cdejNumber: string;
      churchName: string;
      directorName: string;
      managerName: string;
      email: string;
      address: string;
      phone: string;
      onboardingComplete: boolean;
    }>('/config'),

  update: (data: Record<string, unknown>) =>
    request<{ message: string }>('/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  reset: () =>
    request<{ message: string }>('/config/reset', { method: 'POST' }),
};

// ============ BOOKS API ============
export const booksApi = {
  getAll: (params?: { category?: string; available?: boolean; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.available !== undefined) searchParams.set('available', String(params.available));
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return request<Array<{
      id: string;
      title: string;
      author: string;
      isbn: string;
      categoryId: string;
      quantity: number;
      availableCopies: number;
      coverUrl: string;
      createdAt: string;
    }>>(`/books${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    request<{
      id: string;
      title: string;
      author: string;
      isbn: string;
      categoryId: string;
      quantity: number;
      availableCopies: number;
      coverUrl: string;
      createdAt: string;
    }>(`/books/${id}`),

  create: (data: {
    title: string;
    author: string;
    isbn?: string;
    categoryId: string;
    quantity: number;
    coverUrl?: string;
  }) =>
    request<{ id: string }>('/books', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{
    title: string;
    author: string;
    isbn: string;
    categoryId: string;
    quantity: number;
    availableCopies: number;
    coverUrl: string;
  }>) =>
    request<{ message: string }>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/books/${id}`, { method: 'DELETE' }),

  importCsv: (books: Array<Record<string, unknown>>) =>
    request<{ imported: number }>('/books/import', {
      method: 'POST',
      body: JSON.stringify({ books }),
    }),
};

// ============ CATEGORIES API ============
export const categoriesApi = {
  getAll: () =>
    request<Array<{
      id: string;
      name: string;
      color: string;
      bookCount: number;
    }>>('/categories'),

  getById: (id: string) =>
    request<{ id: string; name: string; color: string }>(`/categories/${id}`),

  create: (data: { name: string; color: string }) =>
    request<{ id: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ name: string; color: string }>) =>
    request<{ message: string }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
};

// ============ PARTICIPANTS API ============
export const participantsApi = {
  getAll: (params?: { classId?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.classId) searchParams.set('classId', params.classId);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return request<Array<{
      id: string;
      number: string;
      firstName: string;
      lastName: string;
      age: number;
      ageRange: string;
      gender: string;
      classId: string;
      createdAt: string;
    }>>(`/participants${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    request<{
      id: string;
      number: string;
      firstName: string;
      lastName: string;
      age: number;
      ageRange: string;
      gender: string;
      classId: string;
      createdAt: string;
    }>(`/participants/${id}`),

  create: (data: {
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    classId: string;
  }) =>
    request<{ id: string; number: string }>('/participants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    classId: string;
  }>) =>
    request<{ message: string }>(`/participants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/participants/${id}`, { method: 'DELETE' }),

  importCsv: (participants: Array<Record<string, unknown>>) =>
    request<{ imported: number }>('/participants/import', {
      method: 'POST',
      body: JSON.stringify({ participants }),
    }),

  getJournal: (id: string) =>
    request<{
      loans: Array<Record<string, unknown>>;
      readingSessions: Array<Record<string, unknown>>;
      bookResumes: Array<Record<string, unknown>>;
    }>(`/participants/${id}/journal`),
};

// ============ CLASSES API ============
export const classesApi = {
  getAll: () =>
    request<Array<{
      id: string;
      name: string;
      ageRange: string;
      monitorName: string;
      participantCount: number;
    }>>('/classes'),

  getById: (id: string) =>
    request<{
      id: string;
      name: string;
      ageRange: string;
      monitorName: string;
    }>(`/classes/${id}`),

  create: (data: { name: string; ageRange: string; monitorName: string }) =>
    request<{ id: string }>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ name: string; ageRange: string; monitorName: string }>) =>
    request<{ message: string }>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/classes/${id}`, { method: 'DELETE' }),
};

// ============ LOANS API ============
export const loansApi = {
  getAll: (params?: { status?: string; borrowerType?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.borrowerType) searchParams.set('borrowerType', params.borrowerType);
    const query = searchParams.toString();
    return request<Array<{
      id: string;
      bookId: string;
      borrowerType: string;
      borrowerId: string;
      loanDate: string;
      dueDate: string;
      returnDate: string | null;
      status: string;
      renewCount: number;
    }>>(`/loans${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    request<{
      id: string;
      bookId: string;
      borrowerType: string;
      borrowerId: string;
      loanDate: string;
      dueDate: string;
      returnDate: string | null;
      status: string;
      renewCount: number;
    }>(`/loans/${id}`),

  create: (data: {
    bookId: string;
    borrowerType: string;
    borrowerId: string;
    dueDate: string;
  }) =>
    request<{ id: string }>('/loans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  return: (id: string) =>
    request<{ message: string }>(`/loans/${id}/return`, { method: 'POST' }),

  renew: (id: string, newDueDate: string) =>
    request<{ message: string }>(`/loans/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify({ newDueDate }),
    }),

  delete: (id: string) =>
    request<void>(`/loans/${id}`, { method: 'DELETE' }),
};

// ============ TASKS API ============
export const tasksApi = {
  getAll: () =>
    request<Array<{
      id: string;
      title: string;
      description: string;
      dueDate: string | null;
      priority: string;
      completed: boolean;
      createdAt: string;
    }>>('/tasks'),

  create: (data: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: string;
  }) =>
    request<{ id: string }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    completed: boolean;
  }>) =>
    request<{ message: string }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/tasks/${id}`, { method: 'DELETE' }),
};

// ============ MATERIALS API ============
export const materialsApi = {
  getAll: () =>
    request<Array<{
      id: string;
      name: string;
      typeId: string;
      serialNumber: string;
      quantity: number;
      availableQuantity: number;
      condition: string;
      createdAt: string;
    }>>('/materials'),

  getById: (id: string) =>
    request<Record<string, unknown>>(`/materials/${id}`),

  create: (data: Record<string, unknown>) =>
    request<{ id: string }>('/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    request<{ message: string }>(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/materials/${id}`, { method: 'DELETE' }),

  // Material Types
  getTypes: () =>
    request<Array<{ id: string; name: string; color: string }>>('/materials/types'),

  createType: (data: { name: string; color: string }) =>
    request<{ id: string }>('/materials/types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateType: (id: string, data: Partial<{ name: string; color: string }>) =>
    request<{ message: string }>(`/materials/types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteType: (id: string) =>
    request<void>(`/materials/types/${id}`, { method: 'DELETE' }),

  // Entities
  getEntities: () =>
    request<Array<Record<string, unknown>>>('/materials/entities'),

  createEntity: (data: Record<string, unknown>) =>
    request<{ id: string }>('/materials/entities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEntity: (id: string, data: Record<string, unknown>) =>
    request<{ message: string }>(`/materials/entities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteEntity: (id: string) =>
    request<void>(`/materials/entities/${id}`, { method: 'DELETE' }),

  // Material Loans
  getLoans: (params?: { status?: string }) => {
    const query = params?.status ? `?status=${params.status}` : '';
    return request<Array<Record<string, unknown>>>(`/materials/loans${query}`);
  },

  createLoan: (data: Record<string, unknown>) =>
    request<{ id: string }>('/materials/loans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  returnLoan: (id: string) =>
    request<{ message: string }>(`/materials/loans/${id}/return`, { method: 'POST' }),

  renewLoan: (id: string, newDueDate: string) =>
    request<{ message: string }>(`/materials/loans/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify({ newDueDate }),
    }),
};

// ============ INVENTORY API ============
export const inventoryApi = {
  getSessions: () =>
    request<Array<Record<string, unknown>>>('/inventory/sessions'),

  getSession: (id: string) =>
    request<Record<string, unknown>>(`/inventory/sessions/${id}`),

  createSession: (data: { name: string }) =>
    request<{ id: string }>('/inventory/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeSession: (id: string) =>
    request<{ message: string }>(`/inventory/sessions/${id}/complete`, { method: 'POST' }),

  deleteSession: (id: string) =>
    request<void>(`/inventory/sessions/${id}`, { method: 'DELETE' }),

  getItems: (sessionId: string) =>
    request<Array<Record<string, unknown>>>(`/inventory/sessions/${sessionId}/items`),

  checkItem: (sessionId: string, bookId: string, foundQuantity: number) =>
    request<{ message: string }>(`/inventory/sessions/${sessionId}/items/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify({ foundQuantity }),
    }),

  batchCheck: (sessionId: string, items: Array<{ bookId: string; foundQuantity: number }>) =>
    request<{ message: string }>(`/inventory/sessions/${sessionId}/batch-check`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),
};

// ============ READING SESSIONS API ============
export const readingSessionsApi = {
  getAll: (params?: { participantId?: string; bookId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.participantId) searchParams.set('participantId', params.participantId);
    if (params?.bookId) searchParams.set('bookId', params.bookId);
    const query = searchParams.toString();
    return request<Array<Record<string, unknown>>>(`/reading-sessions${query ? `?${query}` : ''}`);
  },

  create: (data: Record<string, unknown>) =>
    request<{ id: string }>('/reading-sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    request<{ message: string }>(`/reading-sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/reading-sessions/${id}`, { method: 'DELETE' }),

  // Class Reading Sessions
  getClassSessions: () =>
    request<Array<Record<string, unknown>>>('/reading-sessions/class'),

  createClassSession: (data: Record<string, unknown>) =>
    request<{ id: string }>('/reading-sessions/class', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteClassSession: (id: string) =>
    request<void>(`/reading-sessions/class/${id}`, { method: 'DELETE' }),
};

// ============ BOOK ISSUES API ============
export const bookIssuesApi = {
  getAll: (params?: { bookId?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.bookId) searchParams.set('bookId', params.bookId);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return request<Array<Record<string, unknown>>>(`/book-issues${query ? `?${query}` : ''}`);
  },

  create: (data: Record<string, unknown>) =>
    request<{ id: string }>('/book-issues', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    request<{ message: string }>(`/book-issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  resolve: (id: string, resolutionNotes: string) =>
    request<{ message: string }>(`/book-issues/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes }),
    }),

  delete: (id: string) =>
    request<void>(`/book-issues/${id}`, { method: 'DELETE' }),
};

// ============ BOOK RESUMES API ============
export const bookResumesApi = {
  getAll: (params?: { participantId?: string; bookId?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.participantId) searchParams.set('participantId', params.participantId);
    if (params?.bookId) searchParams.set('bookId', params.bookId);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return request<Array<Record<string, unknown>>>(`/book-resumes${query ? `?${query}` : ''}`);
  },

  create: (data: Record<string, unknown>) =>
    request<{ id: string }>('/book-resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    request<{ message: string }>(`/book-resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/book-resumes/${id}`, { method: 'DELETE' }),
};

// ============ OTHER READERS API ============
export const otherReadersApi = {
  getAll: () =>
    request<Array<{
      id: string;
      number: string;
      firstName: string;
      lastName: string;
      readerType: string;
      phone: string;
      email: string;
      notes: string;
      createdAt: string;
    }>>('/other-readers'),

  getById: (id: string) =>
    request<Record<string, unknown>>(`/other-readers/${id}`),

  create: (data: Record<string, unknown>) =>
    request<{ id: string; number: string }>('/other-readers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    request<{ message: string }>(`/other-readers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/other-readers/${id}`, { method: 'DELETE' }),

  getJournal: (id: string) =>
    request<Record<string, unknown>>(`/other-readers/${id}/journal`),
};

// ============ EXTRA ACTIVITIES API ============
export const extraActivitiesApi = {
  getAll: () =>
    request<Array<Record<string, unknown>>>('/extra-activities'),

  create: (data: Record<string, unknown>) =>
    request<{ id: string }>('/extra-activities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    request<{ message: string }>(`/extra-activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/extra-activities/${id}`, { method: 'DELETE' }),

  // Activity Types
  getTypes: () =>
    request<Array<{ id: string; name: string; color: string }>>('/extra-activities/types'),

  createType: (data: { name: string; color: string }) =>
    request<{ id: string }>('/extra-activities/types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateType: (id: string, data: Partial<{ name: string; color: string }>) =>
    request<{ message: string }>(`/extra-activities/types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteType: (id: string) =>
    request<void>(`/extra-activities/types/${id}`, { method: 'DELETE' }),
};

// ============ REPORTS API ============
export const reportsApi = {
  getBookStats: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return request<Record<string, unknown>>(`/reports/books${query ? `?${query}` : ''}`);
  },

  getClassStats: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return request<Record<string, unknown>>(`/reports/classes${query ? `?${query}` : ''}`);
  },

  getParticipantStats: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return request<Record<string, unknown>>(`/reports/participants${query ? `?${query}` : ''}`);
  },

  getLoanStats: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return request<Record<string, unknown>>(`/reports/loans${query ? `?${query}` : ''}`);
  },

  getResumeStats: () =>
    request<Record<string, unknown>>('/reports/resumes'),

  getActivityStats: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return request<Record<string, unknown>>(`/reports/activities${query ? `?${query}` : ''}`);
  },

  getDashboard: () =>
    request<Record<string, unknown>>('/reports/dashboard'),
};

// ============ AUDIT LOG API ============
export const auditLogApi = {
  getAll: (params?: { 
    action?: string; 
    entityType?: string; 
    startDate?: string; 
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.action) searchParams.set('action', params.action);
    if (params?.entityType) searchParams.set('entityType', params.entityType);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();
    return request<{
      logs: Array<Record<string, unknown>>;
      total: number;
      verified: boolean;
    }>(`/audit-log${query ? `?${query}` : ''}`);
  },

  verify: () =>
    request<{ valid: boolean; message: string }>('/audit-log/verify'),

  export: () =>
    request<{ data: string }>('/audit-log/export'),
};

// ============ DATABASE API ============
export const databaseApi = {
  backup: () =>
    request<{ data: string; filename: string }>('/database/backup'),

  getStats: () =>
    request<{
      size: number;
      tables: Record<string, number>;
    }>('/database/stats'),

  reset: () =>
    request<{ message: string }>('/database/reset', { method: 'POST' }),
};
