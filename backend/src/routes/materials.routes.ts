import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

// ============ MATERIAL TYPES ============

const createMaterialTypeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#14B8A6'),
  description: z.string().trim().max(500).optional(),
});

// GET /api/materials/types
router.get('/types', (req, res, next) => {
  try {
    const types = db.prepare('SELECT * FROM material_types ORDER BY name ASC').all();
    res.json(types);
  } catch (error) {
    next(error);
  }
});

// POST /api/materials/types
router.post('/types', validate(createMaterialTypeSchema), (req, res, next) => {
  try {
    const { name, color, description } = req.body;
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO material_types (id, name, color, description)
      VALUES (?, ?, ?, ?)
    `).run(id, name, color, description || null);

    const newType = db.prepare('SELECT * FROM material_types WHERE id = ?').get(id);
    res.status(201).json(newType);
  } catch (error) {
    next(error);
  }
});

// PUT /api/materials/types/:id
router.put('/types/:id', validate(createMaterialTypeSchema.partial()), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM material_types WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Material type not found'));
      return;
    }

    const { name, color, description } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (color !== undefined) { updates.push('color = ?'); values.push(color); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }

    if (updates.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE material_types SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM material_types WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/materials/types/:id
router.delete('/types/:id', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM material_types WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Material type not found'));
      return;
    }

    const materialCount = db.prepare('SELECT COUNT(*) as count FROM materials WHERE type_id = ?')
      .get(req.params.id) as { count: number };

    if (materialCount.count > 0) {
      next(new ApiError(400, 'Cannot delete type with associated materials'));
      return;
    }

    db.prepare('DELETE FROM material_types WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ============ ENTITIES ============

const createEntitySchema = z.object({
  name: z.string().trim().min(1).max(200),
  entityType: z.string().trim().min(1).max(100),
  contactName: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.string().email().max(255).optional(),
  address: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
});

// GET /api/materials/entities
router.get('/entities', (req, res, next) => {
  try {
    const entities = db.prepare('SELECT * FROM entities ORDER BY name ASC').all();
    res.json(entities);
  } catch (error) {
    next(error);
  }
});

// POST /api/materials/entities
router.post('/entities', validate(createEntitySchema), (req, res, next) => {
  try {
    const { name, entityType, contactName, phone, email, address, notes } = req.body;
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO entities (id, name, entity_type, contact_name, phone, email, address, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, entityType, contactName || null, phone || null, email || null, address || null, notes || null);

    const newEntity = db.prepare('SELECT * FROM entities WHERE id = ?').get(id);
    res.status(201).json(newEntity);
  } catch (error) {
    next(error);
  }
});

// PUT /api/materials/entities/:id
router.put('/entities/:id', validate(createEntitySchema.partial()), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM entities WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Entity not found'));
      return;
    }

    const { name, entityType, contactName, phone, email, address, notes } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (entityType !== undefined) {
      updates.push('entity_type = ?');
      values.push(entityType);
    }
    if (contactName !== undefined) {
      updates.push('contact_name = ?');
      values.push(contactName);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }

    if (updates.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE entities SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM entities WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/materials/entities/:id
router.delete('/entities/:id', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM entities WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Entity not found'));
      return;
    }

    const activeLoans = db.prepare(`
      SELECT COUNT(*) as count FROM material_loans 
      WHERE borrower_id = ? AND status != 'returned'
    `).get(req.params.id) as { count: number };

    if (activeLoans.count > 0) {
      next(new ApiError(400, 'Cannot delete entity with active loans'));
      return;
    }

    db.prepare('DELETE FROM entities WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ============ MATERIALS ============

const createMaterialSchema = z.object({
  name: z.string().trim().min(1).max(200),
  typeId: z.string().uuid().optional(),
  serialNumber: z.string().trim().max(100).optional(),
  quantity: z.number().int().min(1).default(1),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']).default('good'),
  notes: z.string().trim().max(1000).optional(),
});

// GET /api/materials
router.get('/', (req, res, next) => {
  try {
    const { typeId, search } = req.query;

    let query = `
      SELECT m.*, mt.name as type_name, mt.color as type_color
      FROM materials m
      LEFT JOIN material_types mt ON m.type_id = mt.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (typeId) {
      query += ' AND m.type_id = ?';
      params.push(typeId);
    }

    if (search) {
      query += ' AND (m.name LIKE ? OR m.serial_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY m.name ASC';

    const materials = db.prepare(query).all(...params);
    res.json(materials);
  } catch (error) {
    next(error);
  }
});

// GET /api/materials/:id
router.get('/:id', (req, res, next) => {
  try {
    if (req.params.id === 'types' || req.params.id === 'entities' || req.params.id === 'loans') {
      next();
      return;
    }

    const material = db.prepare(`
      SELECT m.*, mt.name as type_name, mt.color as type_color
      FROM materials m
      LEFT JOIN material_types mt ON m.type_id = mt.id
      WHERE m.id = ?
    `).get(req.params.id);

    if (!material) {
      next(new ApiError(404, 'Material not found'));
      return;
    }

    res.json(material);
  } catch (error) {
    next(error);
  }
});

// POST /api/materials
router.post('/', validate(createMaterialSchema), (req, res, next) => {
  try {
    const { name, typeId, serialNumber, quantity, condition, notes } = req.body;
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO materials (id, name, type_id, serial_number, quantity, available_quantity, condition, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, typeId || null, serialNumber || null, quantity, quantity, condition, notes || null);

    const newMaterial = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
    res.status(201).json(newMaterial);
  } catch (error) {
    next(error);
  }
});

// PUT /api/materials/:id
router.put('/:id', validate(createMaterialSchema.partial()), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Material not found'));
      return;
    }

    const fieldMap: Record<string, string> = {
      typeId: 'type_id',
      serialNumber: 'serial_number',
      availableQuantity: 'available_quantity',
    };

    const updates = req.body;
    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMap[key] || key;
      setClauses.push(`${dbField} = ?`);
      values.push(value);
    }

    if (setClauses.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE materials SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/materials/:id
router.delete('/:id', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Material not found'));
      return;
    }

    const activeLoans = db.prepare(`
      SELECT COUNT(*) as count FROM material_loans 
      WHERE material_id = ? AND status != 'returned'
    `).get(req.params.id) as { count: number };

    if (activeLoans.count > 0) {
      next(new ApiError(400, 'Cannot delete material with active loans'));
      return;
    }

    db.prepare('DELETE FROM materials WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ============ MATERIAL LOANS ============

const createMaterialLoanSchema = z.object({
  materialId: z.string().uuid(),
  borrowerType: z.enum(['participant', 'entity']),
  borrowerId: z.string().uuid(),
  borrowerName: z.string().trim().min(1).max(200),
  quantity: z.number().int().min(1).default(1),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().trim().max(1000).optional(),
});

// GET /api/materials/loans
router.get('/loans', (req, res, next) => {
  try {
    const { status, materialId } = req.query;

    let query = `
      SELECT ml.*, m.name as material_name
      FROM material_loans ml
      JOIN materials m ON ml.material_id = m.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (status) {
      query += ' AND ml.status = ?';
      params.push(status);
    }

    if (materialId) {
      query += ' AND ml.material_id = ?';
      params.push(materialId);
    }

    query += ' ORDER BY ml.created_at DESC';

    // Update overdue status
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      UPDATE material_loans SET status = 'overdue' 
      WHERE status = 'active' AND due_date < ?
    `).run(today);

    const loans = db.prepare(query).all(...params);
    res.json(loans);
  } catch (error) {
    next(error);
  }
});

// POST /api/materials/loans
router.post('/loans', validate(createMaterialLoanSchema), (req, res, next) => {
  try {
    const { materialId, borrowerType, borrowerId, borrowerName, quantity, dueDate, notes } = req.body;

    const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(materialId) as any;
    if (!material) {
      next(new ApiError(404, 'Material not found'));
      return;
    }

    if (material.available_quantity < quantity) {
      next(new ApiError(400, `Only ${material.available_quantity} available`));
      return;
    }

    const id = crypto.randomUUID();
    const loanDate = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO material_loans (id, material_id, borrower_type, borrower_id, borrower_name, quantity, loan_date, due_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(id, materialId, borrowerType, borrowerId, borrowerName, quantity, loanDate, dueDate, notes || null);

    db.prepare('UPDATE materials SET available_quantity = available_quantity - ? WHERE id = ?').run(quantity, materialId);

    const newLoan = db.prepare('SELECT * FROM material_loans WHERE id = ?').get(id);
    res.status(201).json(newLoan);
  } catch (error) {
    next(error);
  }
});

// POST /api/materials/loans/:id/return
router.post('/loans/:id/return', (req, res, next) => {
  try {
    const loan = db.prepare('SELECT * FROM material_loans WHERE id = ?').get(req.params.id) as any;
    if (!loan) {
      next(new ApiError(404, 'Loan not found'));
      return;
    }

    if (loan.status === 'returned') {
      next(new ApiError(400, 'Loan already returned'));
      return;
    }

    const returnDate = new Date().toISOString().split('T')[0];

    db.prepare(`UPDATE material_loans SET status = 'returned', return_date = ? WHERE id = ?`).run(returnDate, req.params.id);
    db.prepare('UPDATE materials SET available_quantity = available_quantity + ? WHERE id = ?').run(loan.quantity, loan.material_id);

    const updated = db.prepare('SELECT * FROM material_loans WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// POST /api/materials/loans/:id/renew
router.post('/loans/:id/renew', (req, res, next) => {
  try {
    const loan = db.prepare('SELECT * FROM material_loans WHERE id = ?').get(req.params.id) as any;
    if (!loan) {
      next(new ApiError(404, 'Loan not found'));
      return;
    }

    if (loan.status === 'returned') {
      next(new ApiError(400, 'Cannot renew returned loan'));
      return;
    }

    const { dueDate } = req.body;
    db.prepare(`UPDATE material_loans SET due_date = ?, status = 'active' WHERE id = ?`).run(dueDate, req.params.id);

    const updated = db.prepare('SELECT * FROM material_loans WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
