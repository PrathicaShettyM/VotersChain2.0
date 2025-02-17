const express = require("express");
const router = express.Router();
const { processVoterData } = require("../controllers/voterDashboardController");

router.post("/voter/dashboard", processVoterData);

module.exports = router;
