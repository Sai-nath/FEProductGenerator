import express from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// GET all lines of business
router.get('/', async (req, res, next) => {
  try {
    const linesOfBusiness = await prisma.lineOfBusiness.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.json({
      success: true,
      data: linesOfBusiness
    });
  } catch (error) {
    next(error);
  }
});

// GET a single line of business by ID
router.get('/:id', 
  param('id').isUUID().withMessage('Invalid ID format'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      // Ensure params is defined and extract id
      const params = req.params || {};
      const id = params.id as string;
      const lineOfBusiness = await prisma.lineOfBusiness.findUnique({
        where: { id },
        include: { products: true }
      });
      
      if (!lineOfBusiness) {
        const error = new Error('Line of business not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      res.json({
        success: true,
        data: lineOfBusiness
      });
    } catch (error) {
      next(error);
    }
  }
);

// CREATE a new line of business
router.post('/',
  body('name').notEmpty().withMessage('Name is required').isString(),
  body('description').optional().isString(),
  body('isActive').optional().isBoolean(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const { name, description, isActive } = req.body as {
        name: string;
        description?: string | null;
        isActive?: boolean;
      };
      
      // Check if name already exists
      const existing = await prisma.lineOfBusiness.findUnique({
        where: { name }
      });
      
      if (existing) {
        const error = new Error('Line of business with this name already exists') as AppError;
        error.statusCode = 409;
        return next(error);
      }
      
      const newLineOfBusiness = await prisma.lineOfBusiness.create({
        data: {
          name,
          description,
          isActive: isActive ?? true
        }
      });
      
      res.status(201).json({
        success: true,
        data: newLineOfBusiness
      });
    } catch (error) {
      next(error);
    }
  }
);

// UPDATE a line of business
router.put('/:id',
  param('id').isUUID().withMessage('Invalid ID format'),
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('isActive').optional().isBoolean(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      // Ensure params is defined and extract id
      const params = req.params || {};
      const id = params.id as string;
      const { name, description, isActive } = req.body as {
        name?: string;
        description?: string | null;
        isActive?: boolean;
      };
      
      // Check if line of business exists
      const existing = await prisma.lineOfBusiness.findUnique({
        where: { id }
      });
      
      if (!existing) {
        const error = new Error('Line of business not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      // Check if name is already taken by another record
      if (name && name !== existing.name) {
        const nameExists = await prisma.lineOfBusiness.findUnique({
          where: { name }
        });
        
        if (nameExists) {
          const error = new Error('Line of business with this name already exists') as AppError;
          error.statusCode = 409;
          return next(error);
        }
      }
      
      const updatedLineOfBusiness = await prisma.lineOfBusiness.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          description: description ?? existing.description,
          isActive: isActive ?? existing.isActive
        }
      });
      
      res.json({
        success: true,
        data: updatedLineOfBusiness
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE a line of business
router.delete('/:id',
  param('id').isUUID().withMessage('Invalid ID format'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      // Ensure params is defined and extract id
      const params = req.params || {};
      const id = params.id as string;
      
      // Check if line of business exists
      const existing = await prisma.lineOfBusiness.findUnique({
        where: { id },
        include: { products: true }
      });
      
      if (!existing) {
        const error = new Error('Line of business not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      // Check if there are associated products
      if (existing.products.length > 0) {
        const error = new Error('Cannot delete line of business with associated products') as AppError;
        error.statusCode = 400;
        return next(error);
      }
      
      await prisma.lineOfBusiness.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'Line of business deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as lineOfBusinessRoutes };
