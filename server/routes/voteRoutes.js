const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getVoterDashboard, vote } = require("../controllers/voteController");

// Fetch voter details + elections together
router.get("/voter/dashboard", authMiddleware, getVoterDashboard);

// Cast a vote
router.post("/voter/dashboard", authMiddleware, vote);

module.exports = router;
