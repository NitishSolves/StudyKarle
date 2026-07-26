const { body, param, query } = require('express-validator');

const createNoteValidator = [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 2000 }),
  body('subjectId').isInt({ min: 1 }).withMessage('A valid subject is required'),
  body('status').optional().isIn(['draft', 'published'])
];

const updateNoteValidator = [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional({ checkFalsy: true }).isLength({ max: 2000 }),
  body('status').optional().isIn(['draft', 'published'])
];

const idParamValidator = [param('id').isInt({ min: 1 }).withMessage('Invalid id')];

const searchValidator = [
  query('q').trim().isLength({ min: 1, max: 100 }).withMessage('Search query is required')
];

module.exports = {
  createNoteValidator: createNoteValidator,
  updateNoteValidator: updateNoteValidator,
  idParamValidator: idParamValidator,
  searchValidator: searchValidator
};
