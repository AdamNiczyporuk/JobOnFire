import { Router, Request, Response } from 'express';
import passport from 'passport';
import { prisma } from '../db';
import { env } from 'process';
import bcrypt from 'bcrypt';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { userRegisterValidation } from '../validation/authValidation';
import { employerProfileEditValidation } from '../validation/employerValidation';
import { UserRole, Prisma } from '@prisma/client';
import { buildAnonymizedIdentifiers } from '../utils/anonymization';
import { performAccountAnonymization } from '../utils/anonymization/account';

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

        const { username, password, email, role, companyName } = req.body;


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
                        candidateProfile: {
                            create: {}
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
                        employerProfile: {
                            create: {
                                companyName: companyName,
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
    // don't expose passwordHash to client, but indicate if a password is set
    const hasPassword = !!(req.user as any).passwordHash;
    res.json({ user: { username: (req.user as any).username, role: (req.user as any).role, hasPassword } });
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
router.get('/google', (req, res, next) => {
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  if (!role || (role !== 'CANDIDATE' && role !== 'EMPLOYER')) {
    res.status(400).json({ message: 'Role is required and must be CANDIDATE or EMPLOYER' });
    return;
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role
  })(req, res, next);
});

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

// Zmiana hasła dla zalogowanego użytkownika
router.put('/change-password', ensureAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    if (!newPassword) {
      res.status(400).json({ message: 'Brak nowego hasła' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isDeleted) {
      res.status(404).json({ message: 'Użytkownik nie istnieje' });
      return;
    }

    // If user has no password (e.g. created via Google OAuth) disallow password change
    if (!user.passwordHash) {
      res.status(400).json({ message: 'Konto nie ma ustawionego hasła. Zalogowano przez zewnętrznego providera (np. Google).' });
      return;
    }

    // Jeśli użytkownik ma ustawione hasło (nie konto tylko Google), zweryfikuj obecne hasło
    if (user.passwordHash) {
      const ok = await bcrypt.compare(currentPassword || '', user.passwordHash);
      if (!ok) {
        res.status(400).json({ message: 'Nieprawidłowe aktualne hasło' });
        return;
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    res.status(200).json({ message: 'Hasło zostało zmienione' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Błąd serwera podczas zmiany hasła' });
  }
});

// Usunięcie (dezaktywacja) konta zalogowanego użytkownika z anonimizacją danych
router.delete('/delete-account', ensureAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const summary = await performAccountAnonymization(userId);
    if (!summary) {
      res.status(404).json({ message: 'Użytkownik nie istnieje' });
      return;
    }
    req.logout(function(err) {
      if (err) {
        console.error('Logout after delete error:', err);
      }
      req.session?.destroy(() => {
        res.clearCookie('connect.sid');
        res.status(200).json({ 
          message: 'Konto zostało usunięte i zanonimizowane',
          summary
        });
      });
    });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Błąd serwera podczas usuwania konta' });
  }
});

