import express from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

// Create a local implementation of validateScreenConfig to avoid ESM/CommonJS compatibility issues
const validateScreenConfig = (config: any) => {
  // Basic validation logic
  const errors: string[] = [];
  
  if (!config) {
    errors.push('Config is required');
    return { valid: false, errors };
  }
  
  if (!Array.isArray(config.accordions)) {
    errors.push('Config must have an accordions array');
    return { valid: false, errors };
  }
  
  // Validate each accordion has required fields
  for (const accordion of config.accordions) {
    if (!accordion.id) errors.push('Accordion must have an id');
    if (!accordion.title) errors.push('Accordion must have a title');
    if (!Array.isArray(accordion.sections)) errors.push('Accordion must have a sections array');
    
    // Validate sections
    if (Array.isArray(accordion.sections)) {
      for (const section of accordion.sections) {
        if (!section.id) errors.push('Section must have an id');
        if (!section.title) errors.push('Section must have a title');
        if (typeof section.columns !== 'number') errors.push('Section must have a columns number');
        if (!Array.isArray(section.widgets)) errors.push('Section must have a widgets array');
        
        // Validate widgets
        if (Array.isArray(section.widgets)) {
          for (const widget of section.widgets) {
            if (!widget.id) errors.push('Widget must have an id');
            if (!widget.type) errors.push('Widget must have a type');
            if (!widget.label) errors.push('Widget must have a label');
            if (!widget.field) errors.push('Widget must have a field');
          }
        }
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
};

const router = express.Router();

// GET all screen configurations
router.get('/', async (req, res, next) => {
  try {
    const screenConfigurations = await prisma.screenConfiguration.findMany({
      orderBy: { screenName: 'asc' }
    });
    
    res.json({
      success: true,
      data: screenConfigurations
    });
  } catch (error) {
    next(error);
  }
});

// GET a single screen configuration by ID
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
      const screenConfiguration = await prisma.screenConfiguration.findUnique({
        where: { id },
        include: { products: true }
      });
      
      if (!screenConfiguration) {
        const error = new Error('Screen configuration not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      res.json({
        success: true,
        data: screenConfiguration
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET a screen configuration by screenKey
router.get('/key/:screenKey', 
  param('screenKey').isString().withMessage('Screen key must be a string'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      // Ensure params is defined and extract screenKey
      const params = req.params || {};
      const screenKey = params.screenKey as string;
      const screenConfiguration = await prisma.screenConfiguration.findUnique({
        where: { screenKey },
        include: { products: true }
      });
      
      if (!screenConfiguration) {
        const error = new Error('Screen configuration not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      res.json({
        success: true,
        data: screenConfiguration
      });
    } catch (error) {
      next(error);
    }
  }
);

// CREATE a new screen configuration
router.post('/',
  body('screenKey').notEmpty().withMessage('Screen key is required').isString(),
  body('screenName').notEmpty().withMessage('Screen name is required').isString(),
  body('description').optional().isString(),
  body('config').notEmpty().withMessage('Config is required'),
  body('isActive').optional().isBoolean(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const { screenKey, screenName, description, config, isActive } = req.body as {
        screenKey: string;
        screenName: string;
        description?: string | null;
        config: any;
        isActive?: boolean;
      };
      
      // Check if screenKey already exists
      const existing = await prisma.screenConfiguration.findUnique({
        where: { screenKey }
      });
      
      if (existing) {
        const error = new Error('Screen configuration with this key already exists') as AppError;
        error.statusCode = 409;
        return next(error);
      }
      
      // Validate screen configuration structure
      const validation = validateScreenConfig(config);
      if (!validation.valid) {
        const error = new Error(`Invalid screen configuration: ${validation.errors.join(', ')}`) as AppError;
        error.statusCode = 400;
        return next(error);
      }
      
      const newScreenConfiguration = await prisma.screenConfiguration.create({
        data: {
          screenKey,
          screenName,
          description,
          config,
          isActive: isActive ?? true
        }
      });
      
      res.status(201).json({
        success: true,
        data: newScreenConfiguration
      });
    } catch (error) {
      next(error);
    }
  }
);

// UPDATE a screen configuration
router.put('/:id',
  param('id').isUUID().withMessage('Invalid ID format'),
  body('screenKey').optional().isString(),
  body('screenName').optional().isString(),
  body('description').optional().isString(),
  body('config').optional(),
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
      const { screenKey, screenName, description, config, isActive } = req.body as {
        screenKey?: string;
        screenName?: string;
        description?: string | null;
        config?: any;
        isActive?: boolean;
      };
      
      // Check if screen configuration exists
      const existing = await prisma.screenConfiguration.findUnique({
        where: { id }
      });
      
      if (!existing) {
        const error = new Error('Screen configuration not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      // Check if screenKey is already taken by another record
      if (screenKey && screenKey !== existing.screenKey) {
        const keyExists = await prisma.screenConfiguration.findUnique({
          where: { screenKey }
        });
        
        if (keyExists) {
          const error = new Error('Screen configuration with this key already exists') as AppError;
          error.statusCode = 409;
          return next(error);
        }
      }
      
      // Validate screen configuration structure if provided
      if (config) {
        const validation = validateScreenConfig(config);
        if (!validation.valid) {
          const error = new Error(`Invalid screen configuration: ${validation.errors.join(', ')}`) as AppError;
          error.statusCode = 400;
          return next(error);
        }
      }
      
      const updatedScreenConfiguration = await prisma.screenConfiguration.update({
        where: { id },
        data: {
          screenKey: screenKey ?? existing.screenKey,
          screenName: screenName ?? existing.screenName,
          description: description ?? existing.description,
          config: config ?? existing.config,
          isActive: isActive ?? existing.isActive
        }
      });
      
      res.json({
        success: true,
        data: updatedScreenConfiguration
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE a screen configuration
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
      
      // Check if screen configuration exists
      const existing = await prisma.screenConfiguration.findUnique({
        where: { id },
        include: { products: true }
      });
      
      if (!existing) {
        const error = new Error('Screen configuration not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      // Check if there are associated products
      if (existing.products.length > 0) {
        const error = new Error('Cannot delete screen configuration with associated products') as AppError;
        error.statusCode = 400;
        return next(error);
      }
      
      await prisma.screenConfiguration.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'Screen configuration deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as screenConfigurationRoutes };
