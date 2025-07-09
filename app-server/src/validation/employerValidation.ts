import Joi from 'joi';
import { addressValidation } from './addressValidation';
import { CONTRACT_TYPES } from '../constants/employer';

export const employerProfileEditValidation = Joi.object({
  companyName: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Company name is required',
    'string.empty': 'Company name cannot be empty',
    'string.min': 'Company name must be at least 2 characters long',
    'string.max': 'Company name must be at most 100 characters long',
  }),
  companyImageUrl: Joi.string().allow('').custom((value, helpers) => {
    if (!value) return value; // Jeśli puste, to OK
    
    // Sprawdź czy to pełny URL
    try {
      new URL(value);
      return value;
    } catch {
      // Jeśli nie URL, sprawdź czy to ścieżka względna
      if (value.startsWith('/') || value.startsWith('./')) {
        return value;
      }
      return helpers.error('string.invalidImageUrl');
    }
  }).messages({
    'string.invalidImageUrl': 'Company image URL must be a valid URL or relative path'
  }).optional(),
  industry: Joi.array().items(Joi.string().max(100)).optional(),
  description: Joi.string().max(1000).allow('').optional(),
  contractType: Joi.array().items(Joi.string().valid(...CONTRACT_TYPES)).optional(),
  contactPhone: Joi.string().max(30).allow('').optional(),
  contactEmail: Joi.string().email().allow('').optional(),
  benefits: Joi.array().items(Joi.string().max(1000)).optional(),
  // address usunięty z walidacji profilu
});
