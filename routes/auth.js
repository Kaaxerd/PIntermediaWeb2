const express = require("express");
const { validateRegister, validateLogin } = require("../validators/auth");
const { registerCtrl, loginCtrl, verifyEmailCtrl } = require("../controllers/auth");
const handleValidator = require("../utils/handleValidator");
const router = express.Router();

// Solo aplicamos handleValidator en la ruta de registro
router.post("/register", validateRegister, handleValidator, registerCtrl);

// El login no debe tener la validación del correo (no necesitamos handleValidator aquí)
router.post("/verify-email", verifyEmailCtrl);
router.post("/login", validateLogin, loginCtrl);

module.exports = router;