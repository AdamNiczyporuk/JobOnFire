import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import { env } from 'process';
import { prisma } from '../db';


passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password', passReqToCallback: true },
  async (req, username, password, done) => {
    try {
      const role = req.body.role;
      const user = await prisma.user.findFirst({ where: { username, role } }) 
        ?? await prisma.user.findFirst({ where: { email: username, role } });

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



// Serialize user into the sessions
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserialize user from the sessions
passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error);
    }
});
