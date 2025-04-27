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
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const db_1 = require("../db");
passport_1.default.use(new passport_local_1.Strategy((username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var user = yield db_1.prisma.user.findFirst({ where: { username } });
        if (!user) {
            user = yield db_1.prisma.user.findFirst({ where: { email: username } });
            if (!user) {
                return done(null, false, { message: 'Incorrect username or email.' });
            }
        }
        const isValid = yield bcrypt_1.default.compare(password, user.passwordHash || '');
        if (!isValid) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
})));
// Serialize user into the sessions
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
// Deserialize user from the sessions
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_1.prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (error) {
        done(error);
    }
}));
