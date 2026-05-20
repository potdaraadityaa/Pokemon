import { query, param } from 'express-validator';

export const validateGetPokemon = [
  param('name')
    .trim()
    .notEmpty()
    .withMessage('Pokemon name or ID is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Pokemon name must be between 1 and 100 characters'),
];

export const validateSearch = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query (q) is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const validateCompare = [
  query('names')
    .trim()
    .notEmpty()
    .withMessage('names query parameter is required (comma-separated)')
    .custom((value: string) => {
      const parts = value.split(',').map((n) => n.trim()).filter(Boolean);
      if (parts.length < 2) throw new Error('At least 2 Pokemon names are required');
      if (parts.length > 6) throw new Error('Cannot compare more than 6 Pokemon');
      return true;
    }),
];
