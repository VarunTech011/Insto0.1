const express = require('express');
const router = express.Router();

const { registerUser, loginUser,forgotPassword,
  resetPassword } = require('../controllers/user.controller');
const {
    registerValidation,
    loginValidation
} = require('../middlewares/validationMiddleware');



router.post('/login',loginValidation, loginUser);
router.post('/register-user',registerValidation, registerUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


module.exports = router;
