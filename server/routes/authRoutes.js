const express = require('express');
const {register, login} = require('../controllers/authController');
const { check } = require("express-validator");
const router = express.Router();

// additional check to prevent NoSQL Injection and XSS attacks
router.post(
    "/register",
    [
        check("email").isEmail().withMessage("Invalid email"),
        check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
        check("role").isIn(["admin", "voter"]).withMessage("Invalid role"),
    ],
    register
);

router.post(
    "/login",
    [
        check("email").isEmail().withMessage("Invalid email"),
        check("password").notEmpty().withMessage("Password is required"),
    ],
    login
);

module.exports = router;