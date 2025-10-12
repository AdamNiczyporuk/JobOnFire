import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import { env } from 'process';
import { prisma } from '../db';
import { UserRole } from '@prisma/client';


passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password', passReqToCallback: true },
  async (req, username, password, done) => {
    try {
      const role = req.body.role;
      const user = await prisma.user.findFirst({ where: { username, role, isDeleted: false } }) 
        ?? await prisma.user.findFirst({ where: { email: username, role, isDeleted: false } });

      if (!user) {
        return done(null, false, { message: 'Incorrect username/email or role.' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash || '');
      if (!isValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth2 Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.BASE_SERVER_URL}/api/v1/auth/google/callback`,
  passReqToCallback: true, // dodane!
},
  async function (req, _accessToken, _refreshToken, profile: GoogleProfile, done) {
    try {
      // Odczytaj rolę z req.query.state (przekazaną przez frontend)
      const role = ((req.query.state as string) || 'CANDIDATE').toUpperCase();
      const userRole: UserRole = role === 'EMPLOYER' ? UserRole.EMPLOYER : UserRole.CANDIDATE;
      let user = await prisma.user.findFirst({ where: { email: profile.emails?.[0]?.value } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            username: profile.displayName.replace(/\s/g, "").toLowerCase(),
            email: profile.emails?.[0]?.value || '',
            role: userRole,
            registerDate: new Date(),
            isDeleted: false,
            candidateProfile: userRole === UserRole.CANDIDATE ? { create: {} } : undefined,
            employerProfile: userRole === UserRole.EMPLOYER ? { create: { companyName: profile.displayName } } : undefined,
            passwordHash: null,
          },
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user into the sessions
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserialize user from the sessions
passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await prisma.user.findUnique({ 
          where: { id },
          include: { employerProfile: true, candidateProfile: true }
        });
        done(null, user);
    } catch (error) {
        done(error);
    }
});
