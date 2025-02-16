const express = require('express');
const router = express.Router();
const {getElectionDetails} = require("../controllers/electionPageControllers");

router.get('/elections', getElectionDetails);

module.exports = router;