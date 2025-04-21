// backend/src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Usuario } = require('../models');
const logger = require('./logger');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar usuario existente
        let usuario = await Usuario.findOne({ where: { googleId: profile.id } });
        
        if (!usuario) {
          // Verificar si es uno de los dos usuarios permitidos (implementar lista blanca)
          // Este es solo un ejemplo, deberías implementar tu propia lógica de autorización
          const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || [];
          
          if (!allowedEmails.includes(profile.emails[0].value)) {
            return done(null, false, { message: 'No tiene autorización para acceder.' });
          }
          
          // Crear nuevo usuario
          usuario = await Usuario.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            nombre: profile.displayName
          });
        }
        
        return done(null, usuario);
      } catch (error) {
        logger.error('Error en autenticación Google:', error);
        return done(error);
      }
    }
  )
);

module.exports = passport;