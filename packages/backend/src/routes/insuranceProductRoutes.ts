import express from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// GET all insurance products
router.get('/', async (req, res, next) => {
  try {
    const insuranceProducts = await prisma.insuranceProduct.findMany({
      include: {
        lob: true,
        screenConfig: {
          select: {
            id: true,
            screenKey: true,
            screenName: true,
            isActive: true
          }
        }
      },
      orderBy: { productName: 'asc' }
    });
    
    res.json({
      success: true,
      data: insuranceProducts
    });
  } catch (error) {
    next(error);
  }
});

// GET a single insurance product by ID
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
      const insuranceProduct = await prisma.insuranceProduct.findUnique({
        where: { id },
        include: {
          lob: true,
          screenConfig: true
        }
      });
      
      if (!insuranceProduct) {
        const error = new Error('Insurance product not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      res.json({
        success: true,
        data: insuranceProduct
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET insurance products by line of business ID
router.get('/lob/:lobId', 
  param('lobId').isUUID().withMessage('Invalid LOB ID format'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      // Ensure params is defined and extract lobId
      const params = req.params || {};
      const lobId = params.lobId as string;
      
      // Check if line of business exists
      const lob = await prisma.lineOfBusiness.findUnique({
        where: { id: lobId }
      });
      
      if (!lob) {
        const error = new Error('Line of business not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      const insuranceProducts = await prisma.insuranceProduct.findMany({
        where: { lobId },
        include: {
          lob: true,
          screenConfig: {
            select: {
              id: true,
              screenKey: true,
              screenName: true,
              isActive: true
            }
          }
        },
        orderBy: { productName: 'asc' }
      });
      
      res.json({
        success: true,
        data: insuranceProducts
      });
    } catch (error) {
      next(error);
    }
  }
);

// CREATE a new insurance product
router.post('/',
  body('productKey').notEmpty().withMessage('Product key is required').isString(),
  body('productName').notEmpty().withMessage('Product name is required').isString(),
  body('description').optional().isString(),
  body('lobId').optional().isUUID().withMessage('Invalid LOB ID format'),
  body('screenConfigId').notEmpty().withMessage('Screen configuration ID is required').isUUID().withMessage('Invalid screen config ID format'),
  body('isActive').optional().isBoolean(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const { productKey, productName, description, lobId, screenConfigId, isActive } = req.body as {
        productKey: string;
        productName: string;
        description?: string | null;
        lobId?: string | null;
        screenConfigId: string;
        isActive?: boolean;
      };
      
      // Check if productKey already exists
      const existing = await prisma.insuranceProduct.findUnique({
        where: { productKey }
      });
      
      if (existing) {
        const error = new Error('Insurance product with this key already exists') as AppError;
        error.statusCode = 409;
        return next(error);
      }
      
      // Check if screen configuration exists
      const screenConfig = await prisma.screenConfiguration.findUnique({
        where: { id: screenConfigId }
      });
      
      if (!screenConfig) {
        const error = new Error('Screen configuration not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      // Check if line of business exists (if provided)
      if (lobId) {
        const lob = await prisma.lineOfBusiness.findUnique({
          where: { id: lobId }
        });
        
        if (!lob) {
          const error = new Error('Line of business not found') as AppError;
          error.statusCode = 404;
          return next(error);
        }
      }
      
      const newInsuranceProduct = await prisma.insuranceProduct.create({
        data: {
          productKey,
          productName,
          description,
          lobId,
          screenConfigId,
          isActive: isActive ?? true
        },
        include: {
          lob: true,
          screenConfig: true
        }
      });
      
      res.status(201).json({
        success: true,
        data: newInsuranceProduct
      });
    } catch (error) {
      next(error);
    }
  }
);

// UPDATE an insurance product
router.put('/:id',
  param('id').isUUID().withMessage('Invalid ID format'),
  body('productKey').optional().isString(),
  body('productName').optional().isString(),
  body('description').optional().isString(),
  body('lobId').optional().isUUID().withMessage('Invalid LOB ID format'),
  body('screenConfigId').optional().isUUID().withMessage('Invalid screen config ID format'),
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
      const { productKey, productName, description, lobId, screenConfigId, isActive } = req.body as {
        productKey?: string;
        productName?: string;
        description?: string | null;
        lobId?: string | null;
        screenConfigId?: string;
        isActive?: boolean;
      };
      
      // Check if insurance product exists
      const existing = await prisma.insuranceProduct.findUnique({
        where: { id }
      });
      
      if (!existing) {
        const error = new Error('Insurance product not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      // Check if productKey is already taken by another record
      if (productKey && productKey !== existing.productKey) {
        const keyExists = await prisma.insuranceProduct.findUnique({
          where: { productKey }
        });
        
        if (keyExists) {
          const error = new Error('Insurance product with this key already exists') as AppError;
          error.statusCode = 409;
          return next(error);
        }
      }
      
      // Check if screen configuration exists (if provided)
      if (screenConfigId) {
        const screenConfig = await prisma.screenConfiguration.findUnique({
          where: { id: screenConfigId }
        });
        
        if (!screenConfig) {
          const error = new Error('Screen configuration not found') as AppError;
          error.statusCode = 404;
          return next(error);
        }
      }
      
      // Check if line of business exists (if provided)
      if (lobId) {
        const lob = await prisma.lineOfBusiness.findUnique({
          where: { id: lobId }
        });
        
        if (!lob) {
          const error = new Error('Line of business not found') as AppError;
          error.statusCode = 404;
          return next(error);
        }
      }
      
      const updatedInsuranceProduct = await prisma.insuranceProduct.update({
        where: { id },
        data: {
          productKey: productKey ?? existing.productKey,
          productName: productName ?? existing.productName,
          description: description ?? existing.description,
          lobId: lobId !== undefined ? lobId : existing.lobId,
          screenConfigId: screenConfigId ?? existing.screenConfigId,
          isActive: isActive ?? existing.isActive
        },
        include: {
          lob: true,
          screenConfig: true
        }
      });
      
      res.json({
        success: true,
        data: updatedInsuranceProduct
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE an insurance product
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
      
      // Check if insurance product exists
      const existing = await prisma.insuranceProduct.findUnique({
        where: { id }
      });
      
      if (!existing) {
        const error = new Error('Insurance product not found') as AppError;
        error.statusCode = 404;
        return next(error);
      }
      
      await prisma.insuranceProduct.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'Insurance product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as insuranceProductRoutes };
