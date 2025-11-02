import Joi from 'joi';

// Validation for creating a test manually
export const recruitmentTestCreateValidation = Joi.object({
  jobOfferId: Joi.number().integer().positive().required().messages({
    'any.required': 'Job offer ID is required',
    'number.base': 'Job offer ID must be a number',
    'number.positive': 'Job offer ID must be positive',
  }),
  testJson: Joi.object().required().messages({
    'any.required': 'Test data is required',
    'object.base': 'Test data must be a valid object',
  }),
});

// Validation for generating a test with AI
export const recruitmentTestGenerateValidation = Joi.object({
  jobOfferId: Joi.number().integer().positive().required().messages({
    'any.required': 'Job offer ID is required',
    'number.base': 'Job offer ID must be a number',
    'number.positive': 'Job offer ID must be positive',
  }),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional().default('medium'),
  numQuestions: Joi.number().integer().min(1).max(50).optional().default(10).messages({
    'number.min': 'Number of questions must be at least 1',
    'number.max': 'Number of questions cannot exceed 50',
    'number.base': 'Number of questions must be a number',
  }),
  language: Joi.string().valid('pl', 'en').optional().default('pl'),
});

// Validation for updating a test
export const recruitmentTestUpdateValidation = Joi.object({
  testJson: Joi.object().required().messages({
    'any.required': 'Test data is required',
    'object.base': 'Test data must be a valid object',
  }),
});
