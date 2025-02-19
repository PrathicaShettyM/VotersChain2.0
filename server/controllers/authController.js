require("dotenv").config();
const { validationResult } = require("express-validator");
const Voter = require("../models/Voter");
const jwt = require("jsonwebtoken");
const Device = require("../models/Device");
const useragent = require("express-useragent");

// JWT based login for voters and candidates
const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
        return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
        // Check if the user is Admin: from (.env)
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

        if (password !== voter.password)
            return res.status(400).json({ message: "Invalid Credentials" });

        // Generate JWT token for voter with explicit role
        const token = jwt.sign(
            { id: voter._id, role: "voter" },  
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        // Extract device details from request headers
        const source = req.headers["user-agent"];
        const agent = useragent.parse(source);

        // Store device info in DB
        const deviceData = {
            browser_info: agent.browser,
            OS: agent.os,
            type: agent.isMobile ? "Mobile" : agent.isDesktop ? "Desktop" : "Tablet",
            email: voter.email,
            ethereumAddress: voter.ethereumAddress,
        };

        await Device.create(deviceData);

        res.json({ 
            token, 
            role: "voter", 
            email: voter.email,
            redirectTo: "/voter/dashboard",
            message: "Login successful as voter"
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { login };
