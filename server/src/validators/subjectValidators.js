const { body, param } = require('express-validator');

const createSubjectValidator = [
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Name must be 2-150 characters'),
  body('semesterId').isInt({ min: 1 }).withMessage('A valid semester is required'),
  body('icon').optional().trim().isLength({ max: 60 }),
  body('color').optional().trim().isLength({ max: 30 })
];

const updateSubjectValidator = [
  param('id').isInt({ min: 1 }),
  body('name').optional().trim().isLength({ min: 2, max: 150 }),
  body('icon').optional().trim().isLength({ max: 60 }),
  body('color').optional().trim().isLength({ max: 30 })
];

module.exports = {
  createSubjectValidator: createSubjectValidator,
  updateSubjectValidator: updateSubjectValidator
};
