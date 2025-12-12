import { useLibraryStore } from './useLibraryStore';
import { logAuditAction, type AuditModule, type AuditAction } from './useAuditLog';

/**
 * A wrapper around useLibraryStore that automatically logs audit entries
 * for critical operations.
 */
export function useAuditedLibraryStore() {
  const store = useLibraryStore();

  // Book operations with audit
  const addBookAudited = async (book: Parameters<typeof store.addBook>[0]) => {
    const result = store.addBook(book);
    await logAuditAction('create', 'books', `Livre ajouté: ${book.title} par ${book.author}`);
    return result;
  };

  const updateBookAudited = async (id: string, updates: Parameters<typeof store.updateBook>[1]) => {
    const book = store.getBookById(id);
    store.updateBook(id, updates);
    await logAuditAction('update', 'books', `Livre modifié: ${book?.title || id}`);
  };

  const deleteBookAudited = async (id: string) => {
    const book = store.getBookById(id);
    store.deleteBook(id);
    await logAuditAction('delete', 'books', `Livre supprimé: ${book?.title || id}`);
  };

  // Category operations with audit
  const addCategoryAudited = async (category: Parameters<typeof store.addCategory>[0]) => {
    const result = store.addCategory(category);
    await logAuditAction('create', 'categories', `Catégorie ajoutée: ${category.name}`);
    return result;
  };

  const updateCategoryAudited = async (id: string, updates: Parameters<typeof store.updateCategory>[1]) => {
    const category = store.getCategoryById(id);
    store.updateCategory(id, updates);
    await logAuditAction('update', 'categories', `Catégorie modifiée: ${category?.name || id}`);
  };

  const deleteCategoryAudited = async (id: string) => {
    const category = store.getCategoryById(id);
    store.deleteCategory(id);
    await logAuditAction('delete', 'categories', `Catégorie supprimée: ${category?.name || id}`);
  };

  // Loan operations with audit
  const addLoanAudited = async (loan: Parameters<typeof store.addLoan>[0]) => {
    const book = store.getBookById(loan.bookId);
    const borrower = loan.borrowerType === 'participant' 
      ? store.getParticipantById(loan.borrowerId) 
      : store.getOtherReaderById(loan.borrowerId);
    const borrowerName = borrower ? `${borrower.firstName} ${borrower.lastName}` : 'Inconnu';
    const result = store.addLoan(loan);
    await logAuditAction('loan_create', 'loans', `Prêt créé: ${book?.title || loan.bookId} à ${borrowerName}`);
    return result;
  };

  const returnLoanAudited = async (id: string) => {
    const loan = store.getLoanById(id);
    const book = loan ? store.getBookById(loan.bookId) : null;
    store.returnLoan(id);
    await logAuditAction('loan_return', 'loans', `Livre retourné: ${book?.title || 'inconnu'} par ${loan?.borrowerName || 'inconnu'}`);
  };

  const renewLoanAudited = async (id: string, newDueDate: string) => {
    const loan = store.getLoanById(id);
    const book = loan ? store.getBookById(loan.bookId) : null;
    store.renewLoan(id, newDueDate);
    await logAuditAction('loan_renew', 'loans', `Prêt renouvelé: ${book?.title || 'inconnu'} jusqu'au ${newDueDate}`);
  };

  // Participant operations with audit
  const addParticipantAudited = async (participant: Parameters<typeof store.addParticipant>[0]) => {
    const result = store.addParticipant(participant);
    await logAuditAction('create', 'participants', `Participant ajouté: ${participant.firstName} ${participant.lastName}`);
    return result;
  };

  const updateParticipantAudited = async (id: string, updates: Parameters<typeof store.updateParticipant>[1]) => {
    const participant = store.getParticipantById(id);
    store.updateParticipant(id, updates);
    await logAuditAction('update', 'participants', `Participant modifié: ${participant?.firstName} ${participant?.lastName}`);
  };

  const deleteParticipantAudited = async (id: string) => {
    const participant = store.getParticipantById(id);
    store.deleteParticipant(id);
    await logAuditAction('delete', 'participants', `Participant supprimé: ${participant?.firstName} ${participant?.lastName}`);
  };

  // Class operations with audit
  const addClassAudited = async (classData: Parameters<typeof store.addClass>[0]) => {
    const result = store.addClass(classData);
    await logAuditAction('create', 'classes', `Classe ajoutée: ${classData.name}`);
    return result;
  };

  const updateClassAudited = async (id: string, updates: Parameters<typeof store.updateClass>[1]) => {
    const cls = store.getClassById(id);
    store.updateClass(id, updates);
    await logAuditAction('update', 'classes', `Classe modifiée: ${cls?.name || id}`);
  };

  const deleteClassAudited = async (id: string) => {
    const cls = store.getClassById(id);
    store.deleteClass(id);
    await logAuditAction('delete', 'classes', `Classe supprimée: ${cls?.name || id}`);
  };

  // Book issues with audit
  const addBookIssueAudited = async (issue: Parameters<typeof store.addBookIssue>[0]) => {
    const book = store.getBookById(issue.bookId);
    const result = store.addBookIssue(issue);
    await logAuditAction('issue_report', 'book_issues', `Problème signalé: ${book?.title || issue.bookId} - ${issue.issueType}`);
    return result;
  };

  const resolveBookIssueAudited = async (id: string, status: 'resolved' | 'written_off', resolution: string) => {
    const issue = store.getBookIssueById(id);
    const book = issue ? store.getBookById(issue.bookId) : null;
    store.resolveBookIssue(id, status, resolution);
    await logAuditAction('issue_resolve', 'book_issues', `Problème résolu: ${book?.title || 'inconnu'} - ${status}`);
  };

  // Inventory with audit
  const startInventoryAudited = async (name: string, type: 'annual' | 'adhoc', notes?: string) => {
    const result = store.createInventorySession(name, type, notes);
    await logAuditAction('inventory_start', 'inventory', `Inventaire démarré: ${name} (${type})`);
    return result;
  };

  const completeInventoryAudited = async (id: string) => {
    const session = store.inventorySessions.find(s => s.id === id);
    store.completeInventorySession(id);
    await logAuditAction('inventory_complete', 'inventory', `Inventaire terminé: ${session?.name || id}`);
  };

  // Other readers with audit
  const addOtherReaderAudited = async (reader: Parameters<typeof store.addOtherReader>[0]) => {
    const result = store.addOtherReader(reader);
    await logAuditAction('create', 'other_readers', `Autre lecteur ajouté: ${reader.firstName} ${reader.lastName}`);
    return result;
  };

  const updateOtherReaderAudited = async (id: string, updates: Parameters<typeof store.updateOtherReader>[1]) => {
    const reader = store.getOtherReaderById(id);
    store.updateOtherReader(id, updates);
    await logAuditAction('update', 'other_readers', `Autre lecteur modifié: ${reader?.firstName} ${reader?.lastName}`);
  };

  const deleteOtherReaderAudited = async (id: string) => {
    const reader = store.getOtherReaderById(id);
    store.deleteOtherReader(id);
    await logAuditAction('delete', 'other_readers', `Autre lecteur supprimé: ${reader?.firstName} ${reader?.lastName}`);
  };

  // Materials with audit
  const addMaterialAudited = async (material: Parameters<typeof store.addMaterial>[0]) => {
    const result = store.addMaterial(material);
    await logAuditAction('create', 'materials', `Matériel ajouté: ${material.name}`);
    return result;
  };

  const updateMaterialAudited = async (id: string, updates: Parameters<typeof store.updateMaterial>[1]) => {
    const material = store.getMaterialById(id);
    store.updateMaterial(id, updates);
    await logAuditAction('update', 'materials', `Matériel modifié: ${material?.name || id}`);
  };

  const deleteMaterialAudited = async (id: string) => {
    const material = store.getMaterialById(id);
    store.deleteMaterial(id);
    await logAuditAction('delete', 'materials', `Matériel supprimé: ${material?.name || id}`);
  };

  // Reading sessions with audit
  const addReadingSessionAudited = async (session: Parameters<typeof store.addReadingSession>[0]) => {
    const participant = store.getParticipantById(session.participantId);
    const book = store.getBookById(session.bookId);
    const result = store.addReadingSession(session);
    await logAuditAction('create', 'reading_sessions', `Session ajoutée: ${participant?.firstName || 'inconnu'} - ${book?.title || 'inconnu'}`);
    return result;
  };

  const deleteReadingSessionAudited = async (id: string) => {
    const session = store.getReadingSessionById(id);
    store.deleteReadingSession(id);
    await logAuditAction('delete', 'reading_sessions', `Session supprimée: ${session?.id || id}`);
  };

  // Extra activities with audit
  const addExtraActivityAudited = async (activity: Parameters<typeof store.addExtraActivity>[0]) => {
    const type = store.getExtraActivityTypeById(activity.activityTypeId);
    const result = store.addExtraActivity(activity);
    await logAuditAction('create', 'extra_activities', `Activité ajoutée: ${type?.name || 'inconnu'} le ${activity.date}`);
    return result;
  };

  const deleteExtraActivityAudited = async (id: string) => {
    const activity = store.getExtraActivityById(id);
    const type = activity ? store.getExtraActivityTypeById(activity.activityTypeId) : null;
    store.deleteExtraActivity(id);
    await logAuditAction('delete', 'extra_activities', `Activité supprimée: ${type?.name || 'inconnu'}`);
  };

  return {
    // Return all original store methods with audited versions replacing the originals
    ...store,
    
    // Replace book operations with audited versions
    addBook: addBookAudited,
    updateBook: updateBookAudited,
    deleteBook: deleteBookAudited,
    
    // Replace category operations with audited versions
    addCategory: addCategoryAudited,
    updateCategory: updateCategoryAudited,
    deleteCategory: deleteCategoryAudited,
    
    // Replace loan operations with audited versions
    addLoan: addLoanAudited,
    returnLoan: returnLoanAudited,
    renewLoan: renewLoanAudited,
    
    // Replace participant operations with audited versions
    addParticipant: addParticipantAudited,
    updateParticipant: updateParticipantAudited,
    deleteParticipant: deleteParticipantAudited,
    
    // Replace class operations with audited versions
    addClass: addClassAudited,
    updateClass: updateClassAudited,
    deleteClass: deleteClassAudited,
    
    // Replace book issue operations with audited versions
    addBookIssue: addBookIssueAudited,
    resolveBookIssue: resolveBookIssueAudited,
    
    // Replace inventory operations with audited versions
    createInventorySession: startInventoryAudited,
    completeInventorySession: completeInventoryAudited,
    
    // Replace other reader operations with audited versions
    addOtherReader: addOtherReaderAudited,
    updateOtherReader: updateOtherReaderAudited,
    deleteOtherReader: deleteOtherReaderAudited,
    
    // Replace material operations with audited versions
    addMaterial: addMaterialAudited,
    updateMaterial: updateMaterialAudited,
    deleteMaterial: deleteMaterialAudited,
    
    // Replace reading session operations with audited versions
    addReadingSession: addReadingSessionAudited,
    deleteReadingSession: deleteReadingSessionAudited,
    
    // Replace extra activity operations with audited versions
    addExtraActivity: addExtraActivityAudited,
    deleteExtraActivity: deleteExtraActivityAudited,
  };
}
