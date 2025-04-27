import { Router, Request, Response } from 'express';
import passport from 'passport';
import { prisma } from '../db';
import { env } from 'process';
import bcrypt from 'bcrypt';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { userRegisterValidation } from '../validation/userRegisterValidation';
import { UserRole } from '@prisma/client';

export const router = Router();

// Register Route
router.post(
    '/register',
    async (req: Request, res: Response): Promise<void> => {

        const { error, value } = userRegisterValidation.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            res.status(400).send({ message: 'Validation failed', errors });
            return;
        }

        const { username, password, email, role } = req.body;


        console.log('Request Body:', req.body);

        try {
            const existingUser = await prisma.user.findFirst({ where: { username } }) ?? await prisma.user.findFirst({ where: { email } });
            if (existingUser) {
                res.status(400).send({ message: 'User already exists' });
                return;
            }

            const passwordHash = await bcrypt.hash(password, 10);

            // Tworzenie użytkownika w zależności od roli
            let user;

            if (role === 'CANDIDATE') {
                user = await prisma.user.create({
                    data: {
                        username,
                        passwordHash,
                        email,
                        role: UserRole.CANDIDATE,
                        registerDate: new Date(),
                        isDeleted: false,
                        // Dodajemy profil kandydata
                        candidateProfile: {
                            create: {

                            },
                        },
                    },
                });
            } else if (role === 'EMPLOYER') {
                user = await prisma.user.create({
                    data: {
                        username,
                        passwordHash,
                        email,
                        role: UserRole.EMPLOYER,
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
            } else {
                res.status(400).send({ message: 'Invalid role provided' });
                return;
            }

            res.status(200).send({ 
                message: 'User registered successfully', 
                user: await prisma.user.findUnique({
                    where: { id: user.id },
                    include: { employerProfile: true, candidateProfile: true }
                })
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).send({ message: 'Error registering user', error });
        }
    }
);