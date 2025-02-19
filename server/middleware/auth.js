const jwt = require('jsonwebtoken');

// middleware for JWT login
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    console.log("Incoming Token:", token); 

    if (!token?.startsWith("Bearer ")) {
        console.log("No token or incorrect format");
        return res.status(401).json({ message: "Access Denied" });
    }

    const tokenValue = token.split(" ")[1];

    try {
        const verified = jwt.verify(tokenValue, process.env.JWT_SECRET);
        console.log("Verified User:", verified); //  Debugging: Check if JWT is valid
        req.user = verified;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({ message: "Invalid Token" });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied. Admins Only." });
    }
    next();
};

module.exports = { authMiddleware, authorizeAdmin };
