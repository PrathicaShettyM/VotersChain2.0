const express = require('express');
const { login } = require('../controllers/authController');
const { check } = require("express-validator");
const router = express.Router();

// additional check to prevent NoSQL Injection and XSS attacks

router.post(
    "/login",
    [
        check("email").isEmail().withMessage("Invalid email"),
        check("password").notEmpty().withMessage("Password is required"),
    ],
    login
);

module.exports = router;