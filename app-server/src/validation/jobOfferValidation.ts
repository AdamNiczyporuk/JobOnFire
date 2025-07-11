import Joi from 'joi';

export const jobOfferCreateValidation = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    'any.required': 'Job offer name is required',
    'string.empty': 'Job offer name cannot be empty',
    'string.min': 'Job offer name must be at least 3 characters long',
    'string.max': 'Job offer name must be at most 200 characters long',
  }),
  description: Joi.string().max(5000).allow('').optional(),
  jobLevel: Joi.array().items(Joi.string().max(100)).max(10).allow(null).optional(),
  contractType: Joi.string().max(100).allow('').optional(),
  salary: Joi.string().max(200).allow('').optional(),
  expireDate: Joi.date().greater('now').required().messages({
    'any.required': 'Expire date is required',
    'date.greater': 'Expire date must be in the future',
  }),
  workingMode: Joi.array().items(Joi.string().max(100)).max(10).allow(null).optional(),
  workload: Joi.string().max(100).allow('').optional(),
  responsibilities: Joi.array().items(Joi.string().max(500)).max(20).allow(null).optional(),
  requirements: Joi.array().items(Joi.string().max(500)).max(20).allow(null).optional(),
  whatWeOffer: Joi.array().items(Joi.string().max(500)).max(20).allow(null).optional(),
  applicationUrl: Joi.string().uri().allow('').optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(30).allow(null).optional(),
  lokalizationId: Joi.number().integer().positive().allow(null).optional(),
});

export const jobOfferUpdateValidation = Joi.object({
  name: Joi.string().min(3).max(200).optional().messages({
    'string.empty': 'Job offer name cannot be empty',
    'string.min': 'Job offer name must be at least 3 characters long',
    'string.max': 'Job offer name must be at most 200 characters long',
  }),
  description: Joi.string().max(5000).allow('').optional(),
  jobLevel: Joi.array().items(Joi.string().max(100)).max(10).allow(null).optional(),
  contractType: Joi.string().max(100).allow('').optional(),
  salary: Joi.string().max(200).allow('').optional(),
  expireDate: Joi.date().greater('now').optional().messages({
    'date.greater': 'Expire date must be in the future',
  }),
  workingMode: Joi.array().items(Joi.string().max(100)).max(10).allow(null).optional(),
  workload: Joi.string().max(100).allow('').optional(),
  responsibilities: Joi.array().items(Joi.string().max(500)).max(20).allow(null).optional(),
  requirements: Joi.array().items(Joi.string().max(500)).max(20).allow(null).optional(),
  whatWeOffer: Joi.array().items(Joi.string().max(500)).max(20).allow(null).optional(),
  applicationUrl: Joi.string().uri().allow('').optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(30).allow(null).optional(),
  lokalizationId: Joi.number().integer().positive().allow(null).optional(),
  isActive: Joi.boolean().optional(),
});
