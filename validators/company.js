const { check } = require('express-validator');
const handleValidator = require('../utils/handleValidator');

const validateCompany = [
    check('name').exists().notEmpty().withMessage('El nombre es obligatorio'),
    check('cif').exists().notEmpty().withMessage('El CIF es obligatorio'),
    check('street').exists().notEmpty().withMessage('La calle es obligatoria'),
    check('number').exists().isNumeric().withMessage('El número debe ser numérico'),
    check('postal').exists().isNumeric().withMessage('El código postal debe ser numérico'),
    check('city').exists().notEmpty().withMessage('La ciudad es obligatoria'),
    check('province').exists().notEmpty().withMessage('La provincia es obligatoria'),
    (req, res, next) => {
        handleValidator(req, res, next);
    }
];

module.exports = { validateCompany };