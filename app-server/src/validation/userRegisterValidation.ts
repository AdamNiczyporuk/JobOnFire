import Joi from 'joi';

export const userRegisterValidation = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'Username is required',
    'string.empty': 'Username cannot be empty',
  }),
  password: Joi.string().min(8).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address',
  }),
  role: Joi.string().valid('CANDIDATE', 'EMPLOYER').required().messages({
    'any.required': 'Role is required',
    'any.only': 'Role must be either CANDIDATE or EMPLOYER',
  }),
});