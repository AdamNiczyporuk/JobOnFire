"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const authValidation_1 = require("../validation/authValidation");
const client_1 = require("@prisma/client");
exports.router = (0, express_1.Router)();
// Register Route
exports.router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { error, value } = authValidation_1.userRegisterValidation.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        res.status(400).send({ message: 'Validation failed', errors });
        return;
    }
    const { username, password, email, role } = req.body;
    console.log('Request Body:', req.body);
    try {
        const existingUser = (_a = yield db_1.prisma.user.findFirst({ where: { username } })) !== null && _a !== void 0 ? _a : yield db_1.prisma.user.findFirst({ where: { email } });
        if (existingUser) {
            res.status(400).send({ message: 'User already exists' });
            return;
        }
        const passwordHash = yield bcrypt_1.default.hash(password, 10);
        // Tworzenie użytkownika w zależności od roli
        let user;
        if (role === 'CANDIDATE') {
            user = yield db_1.prisma.user.create({
                data: {
                    username,
                    passwordHash,
                    email,
                    role: client_1.UserRole.CANDIDATE,
                    registerDate: new Date(),
                    isDeleted: false,
                    // Dodajemy profil kandydata
                    candidateProfile: {
                        create: {},
                    },
                },
            });
        }
        else if (role === 'EMPLOYER') {
            user = yield db_1.prisma.user.create({
                data: {
                    username,
                    passwordHash,
                    email,
                    role: client_1.UserRole.EMPLOYER,
                    registerDate: new Date(),
                    isDeleted: false,
                    // Dodajemy profil pracodawcy
                    employerProfile: {
                        create: {
                            companyName: username,
                        },
                    },
                },
            });
        }
        else {
            res.status(400).send({ message: 'Invalid role provided' });
            return;
        }
        res.status(200).send({
            message: 'User registered successfully',
            user: yield db_1.prisma.user.findUnique({
                where: { id: user.id },
                include: { employerProfile: true, candidateProfile: true }
            })
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).send({ message: 'Error registering user', error });
    }
}));
// Login Route
exports.router.post('/login', (req, res, next) => {
    passport_1.default.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).send({ message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            res.send({ message: 'Logged in successfully' });
            role: user.role,
            ;
        });
    })(req, res, next);
});
