// backend/src/routes/auth.routes.js
const express = require('express');
const passport = require('passport');
const { authController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

// Rutas de autenticación con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback
);

// Verificar estado de autenticación
router.get('/check', authMiddleware.verifyToken, authController.checkAuth);

// Cerrar sesión
router.post('/logout', authMiddleware.verifyToken, authController.logout);

module.exports = router;