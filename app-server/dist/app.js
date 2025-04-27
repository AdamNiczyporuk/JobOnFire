"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
require("@/env");
require("@/auth/passport");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const process_1 = require("process");
const index_1 = require("./routes/index");
const app = (0, express_1.default)();
// TODO: specify smaller subset of allowed origins (i.e. only our frontend lol)
// Allow all cors
app.use((0, cors_1.default)({
    origin: process_1.env.FRONTEND_BASE_URL || 'http://localhost:5173',
    credentials: true,
}));
// Allow for application/json body content
app.use(body_parser_1.default.json());
// Allow for application/x-www-form-urlencoded body content
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
app.set('trust proxy', true);
// Session middleware
app.use((0, express_session_1.default)({
    secret: process_1.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
// Initialize Passport.js
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/api/v1", index_1.router);
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Internal Server Error' });
});
app.listen(process_1.env.API_PORT, () => {
    console.log(`Listening on port ${process_1.env.API_PORT}`);
});
