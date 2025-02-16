const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization'); // ✅ Correct spelling

    if (!token?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access Denied" });
    }

    const tokenValue = token.split(" ")[1]; // Extract token after 'Bearer '

    try {
        const verified = jwt.verify(tokenValue, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message || "Invalid Token" });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied. Admins Only." });
    }
    next();
};

module.exports = { authMiddleware, authorizeAdmin };
