import Joi from 'joi';

export const applicationCreateValidation = Joi.object({
  message: Joi.string().max(2000).allow('').optional(),
  jobOfferId: Joi.number().integer().positive().required(),
  cvId: Joi.number().integer().positive().required(),
  answers: Joi.array().items(
    Joi.object({
      recruitmentQuestionId: Joi.number().integer().positive().required(),
      answer: Joi.string().max(1000).allow('').optional()
    })
  ).optional()
});

export const applicationUpdateValidation = Joi.object({
  message: Joi.string().max(2000).allow('').optional(),
  status: Joi.string().valid('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED').optional(),
  cvId: Joi.number().integer().positive().optional()
});
