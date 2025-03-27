const express = require("express");
const { validateRegister, validateLogin } = require("../validators/auth");
const { registerCtrl, loginCtrl, verifyEmailCtrl } = require("../controllers/auth");
const router = express.Router();

router.post("/register", validateRegister, registerCtrl)
router.post("/verify-email", verifyEmailCtrl)
//router.post("/login", validateLogin, loginCtrl)

module.exports = router;