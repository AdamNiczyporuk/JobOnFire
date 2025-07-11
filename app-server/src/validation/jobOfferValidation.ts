import Joi from 'joi';

export const jobOfferCreateValidation = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    'any.required': 'Job offer name is required',
    'string.empty': 'Job offer name cannot be empty',
    'string.min': 'Job offer name must be at least 3 characters long',
    'string.max': 'Job offer name must be at most 200 characters long',
  }),
  description: Joi.string().max(5000).allow('').optional(),
  jobLevel: Joi.string().max(100).allow('').optional(),
  contractType: Joi.string().max(100).allow('').optional(),
  salary: Joi.string().max(200).allow('').optional(),
  expireDate: Joi.date().greater('now').required().messages({
    'any.required': 'Expire date is required',
    'date.greater': 'Expire date must be in the future',
  }),
  workingMode: Joi.string().max(100).allow('').optional(),
  workload: Joi.string().max(100).allow('').optional(),
  responsibilities: Joi.string().max(3000).allow('').optional(),
  requirements: Joi.string().max(3000).allow('').optional(),
  whatWeOffer: Joi.string().max(3000).allow('').optional(),
  applicationUrl: Joi.string().uri().allow('').optional(),
  tags: Joi.string().max(500).allow('').optional(),
  lokalizationId: Joi.number().integer().positive().allow(null).optional(),
});

export const jobOfferUpdateValidation = Joi.object({
  name: Joi.string().min(3).max(200).optional().messages({
    'string.empty': 'Job offer name cannot be empty',
    'string.min': 'Job offer name must be at least 3 characters long',
    'string.max': 'Job offer name must be at most 200 characters long',
  }),
  description: Joi.string().max(5000).allow('').optional(),
  jobLevel: Joi.string().max(100).allow('').optional(),
  contractType: Joi.string().max(100).allow('').optional(),
  salary: Joi.string().max(200).allow('').optional(),
  expireDate: Joi.date().greater('now').optional().messages({
    'date.greater': 'Expire date must be in the future',
  }),
  workingMode: Joi.string().max(100).allow('').optional(),
  workload: Joi.string().max(100).allow('').optional(),
  responsibilities: Joi.string().max(3000).allow('').optional(),
  requirements: Joi.string().max(3000).allow('').optional(),
  whatWeOffer: Joi.string().max(3000).allow('').optional(),
  applicationUrl: Joi.string().uri().allow('').optional(),
  tags: Joi.string().max(500).allow('').optional(),
  lokalizationId: Joi.number().integer().positive().allow(null).optional(),
  isActive: Joi.boolean().optional(),
});
