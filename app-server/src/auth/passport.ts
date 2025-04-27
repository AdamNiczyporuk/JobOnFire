import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import { env } from 'process';
import { prisma } from '../db';


passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            var user = await prisma.user.findFirst({ where: { username } });
            if (!user) {
                user = await prisma.user.findFirst({ where: { email: username } });
                if (!user) {
                    return done(null, false, { message: 'Incorrect username or email.' });
                }
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
