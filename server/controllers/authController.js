require("dotenv").config();
const { validationResult } = require("express-validator");
const Voter = require("../models/Voter");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
        return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
        // Check if the user is Admin (fetch from .env)
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { id: "admin", role: "admin" }, 
                process.env.JWT_SECRET, 
                { expiresIn: "1h" }
            );
            return res.status(200).json({ 
                token, 
                role: "admin", 
                email,
                redirectTo: "/admin/dashboard", 
                message: "Login successful as admin"
            });
        }

        // Check if the user is a voter (fetch from DB)
        const voter = await Voter.findOne({ email });
        if (!voter) 
            return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, voter.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid Credentials" });

        // Generate JWT token for voter
        const token = jwt.sign(
            { id: voter._id, role: voter.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        res.json({ 
            token, 
            role: voter.role, 
            email: voter.email,
            redirectTo: "/voter/dashboard",
            message: "Login successful as voter"
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Export the login function
module.exports = { login };
