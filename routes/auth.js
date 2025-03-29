const express = require("express");
const { validateRegister, validateLogin, validateGetUser } = require("../validators/auth");
const { registerCtrl, loginCtrl, verifyEmailCtrl, getUserCtrl, updateUserCtrl } = require("../controllers/auth");
const handleValidator = require("../utils/handleValidator");
const router = express.Router();

router.post("/register", validateRegister, handleValidator, registerCtrl);
router.post("/verify-email", verifyEmailCtrl);
router.post("/login", validateLogin, loginCtrl);
router.put("/:id", updateUserCtrl);

module.exports = router;