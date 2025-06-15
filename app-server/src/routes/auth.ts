import { Router, Request, Response } from 'express';
import passport from 'passport';
import { prisma } from '../db';
import { env } from 'process';
import bcrypt from 'bcrypt';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { userRegisterValidation } from '../validation/authValidation';
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


// Login Route
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: Express.User | false | null, info: any) => {
        if (err) { return next(err); }
        if (!user) { return res.status(400).send({ message: info.message }); }

        req.logIn(user, (err) => {
            if (err) { return next(err); }
            res.send({ 
                message: 'Logged in successfully',
             });
            
        });
    })(req, res, next);
});

router.get('/me', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({ user: { username: req.user.username, role: req.user.role } });
  } else {
    res.status(401).json({ user: null });
  }
});

router.post("/logout", (req, res) => {
  req.logout(function(err) {
    if (err) {
      return res.status(500).json({ message: "Logout failed", error: err });
    }
    req.session?.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

// Google OAuth2
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: process.env.FRONTEND_BASE_URL + '/candidate/login',
  session: true
}), (req, res) => {
  // Po udanym logowaniu przekieruj na dashboard kandydata lub pracodawcy
  if (req.user && req.user.role === 'EMPLOYER') {
    res.redirect(process.env.FRONTEND_BASE_URL + '/employer/dashboard');
  } else {
    res.redirect(process.env.FRONTEND_BASE_URL + '/candidate/dashboard');
  }
});