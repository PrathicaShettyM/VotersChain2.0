const Candidate = require('../models/Candidate');
const { validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const { ethers } = require('ethers');

// Register Candidate
exports.registerCandidate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let { name, party_affiliation, bio } = req.body;

  // Sanitize inputs to prevent NoSQL injection
  name = sanitizeHtml(name);
  party_affiliation = sanitizeHtml(party_affiliation);
  bio = sanitizeHtml(bio);

  try {
    const wallet = ethers.Wallet.createRandom();
    const ethereumAddress = wallet.address;
    
    const newCandidate = new Candidate({
      ethereumAddress,
      name,
      party_affiliation,
      bio,
    });

    await newCandidate.save();

    res.status(201).json({ message: 'Candidate registered successfully' , ethereumAddress});
  } catch (error) {
    res.status(500).json({ message: 'Error registering candidate', error });
    console.log(error);
  }
};

// View All Candidates
exports.viewCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({}, { password: 0 }); // Exclude sensitive fields
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching candidates', error });
  }
};
