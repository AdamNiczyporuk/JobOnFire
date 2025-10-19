import "module-alias/register";

import "@/env";

import '@/auth/passport';
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import passport from "passport";
import { env } from "process";
import { router } from "./routes/index";


const app = express();

// CORS configuration - kluczowe dla sesji i autoryzacji
app.use(cors({
  origin: env.FRONTEND_BASE_URL || 'http://localhost:3000',
  credentials: true, // Pozwala na wysyłanie cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Allow for application/json body content
app.use(bodyParser.json());
// Allow for application/x-www-form-urlencoded body content
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set('trust proxy', true)

// Session middleware
app.use(session({
  secret: env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === 'production', // HTTPS tylko w produkcji
    httpOnly: true, // Zabezpieczenie przed XSS
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dni
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax', // Dla cross-origin w produkcji
  }
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", router);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Internal Server Error' });
});

app.listen(env.API_PORT, () => {
  console.log(`Listening on port ${env.API_PORT}`);
});
