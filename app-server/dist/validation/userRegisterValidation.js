"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRegisterValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.userRegisterValidation = joi_1.default.object({
    username: joi_1.default.string().required().messages({
        'any.required': 'Username is required',
        'string.empty': 'Username cannot be empty',
    }),
    password: joi_1.default.string().min(8).required().messages({
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
    }),
    email: joi_1.default.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email address',
    }),
    role: joi_1.default.string().valid('CANDIDATE', 'EMPLOYER').required().messages({
        'any.required': 'Role is required',
        'any.only': 'Role must be either CANDIDATE or EMPLOYER',
    }),
});
