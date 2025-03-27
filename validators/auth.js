const { check } = require('express-validator');
const handleValidator = require('../utils/handleValidator');

const validateRegister = [
    check('email').exists().notEmpty().isEmail(),
    check('password').isLength({ min: 8 }), // Mínimo 8 caracteres para la contraseña
    (req, res, next) => {
        handleValidator(req, res, next);
    }
];

const validateLogin = [
    check('email').exists().notEmpty().isEmail(),
    check('password').exists().notEmpty(),
    (req, res, next) => {
        handleValidator(req, res, next);
    }
];

module.exports = { validateRegister, validateLogin };