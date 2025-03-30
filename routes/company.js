const express = require("express");
const { validateCompany } = require("../validators/company");
const { createCompanyCtrl, updateCompanyCtrl } = require("../controllers/company");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.post("/", requireAuth, validateCompany, createCompanyCtrl);
router.patch("/:id", requireAuth, validateCompany, updateCompanyCtrl);

module.exports = router;