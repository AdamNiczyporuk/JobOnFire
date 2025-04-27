"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // Użytkownik jest zalogowany, kontynuuj
    }
    res.status(401).json({ message: 'You need to be logged in to access this resource.' });
}
