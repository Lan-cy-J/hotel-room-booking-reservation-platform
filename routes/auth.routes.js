const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { authenticateJWT } = require('../middleware/auth.middleware');

// Optional auth for registration (allows Admin to supply token to register Staff/Admin)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJWT(req, res, next);
  }
  next();
};

router.post('/register', optionalAuth, validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/profile', authenticateJWT, authController.getProfile);

module.exports = router;
