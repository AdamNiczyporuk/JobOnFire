import Joi from 'joi';

const CONTRACT_TYPE_ENUM = [
  'Umowa o pracę',
  'Umowa B2B',
  'Umowa zlecenie',
  'Umowa o dzieło'
];

export const employerProfileEditValidation = Joi.object({
  companyName: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Company name is required',
    'string.empty': 'Company name cannot be empty',
    'string.min': 'Company name must be at least 2 characters long',
    'string.max': 'Company name must be at most 100 characters long',
  }),
  companyImageUrl: Joi.string().uri().allow('').optional(),
  industry: Joi.array().items(Joi.string().max(100)).optional(),
  description: Joi.string().max(1000).allow('').optional(),
  contractType: Joi.array().items(Joi.string().valid(...CONTRACT_TYPE_ENUM)).optional(),
  contactPhone: Joi.string().max(30).allow('').optional(),
  contactEmail: Joi.string().email().allow('').optional(),
  benefits: Joi.array().items(Joi.string().max(1000)).optional(),
  address: Joi.object({
    city: Joi.string().max(100).allow('').optional(),
    state: Joi.string().max(100).allow('').optional(),
    street: Joi.string().max(100).allow('').optional(),
    postalCode: Joi.string().max(20).allow('').optional(),
    latitude: Joi.number().optional(),
    longtitude: Joi.number().optional(),
  }).optional(),
});
