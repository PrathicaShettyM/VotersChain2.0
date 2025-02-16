const Voter = require('../models/Voter');
const { validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const { ethers } = require('ethers');
const nodemailer = require('nodemailer');

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID, // Replace with your email
    pass: process.env.EMAIL_PASS, // Replace with your password (Use App Passwords)
  },
  logger: true, // Log SMTP connection info
  debug: true,  // Enable debug mode
});

// Register Voter
exports.registerVoter = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let { name, email, phoneNumber, dateOfBirth } = req.body;


  // Sanitize inputs to prevent NoSQL injection
  name = sanitizeHtml(name);
  email = sanitizeHtml(email);
  phoneNumber = sanitizeHtml(phoneNumber);
  dateOfBirth = new Date(dateOfBirth);

  // Age Validation: age greater than 18 yrs can vote
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const isOldEnough =
    age > 18 || (age === 18 && today >= new Date(dateOfBirth).setFullYear(dateOfBirth.getFullYear() + 18));

  if (!isOldEnough) {
    return res.status(400).json({ message: "Voter must be at least 18 years old to register." });
  }

  try {
    // Generate Ethereum Wallet
    const wallet = ethers.Wallet.createRandom();
    const ethereumAddress = wallet.address;
    const privateKey = wallet.privateKey; // ⚠️ Storing in plaintext

    const existingVoter = await Voter.findOne({ email });
    if (existingVoter) {
      return res.status(400).json({ message: 'Voter already registered with this email' });
    }

    const newVoter = new Voter({
      ethereumAddress,
      name,
      email,
      phoneNumber,
      dateOfBirth,
      password: privateKey,
      isRegistered: true,
    });

    await newVoter.save();

    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: email,
      subject: 'Your Voting Credentials',
      text: `Hello ${name},
      
              Congratulations on successfully registering as a voter in our election system! Below are your credentials and unique Ethereum address that you will use for the voting process:
              
              Ethereum Address: ${ethereumAddress}
              Private Key: ${privateKey}
              
              Please note:
                1. This information is confidential and should not be shared with anyone.
                2. Keep your Ethereum address secure, as it will be used to cast your vote.
                3. If you encounter any issues during the voting process, feel free to contact our support team. Use this to vote securely.
                    
              The voting system ensures transparency and security by leveraging blockchain technology. With your credentials, you will be able to access the voting portal and participate in shaping the future.
  
              Thank you for being an active participant in our democratic process. Your vote matters!
  
              Best regards,  
              Election Commission Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ 
      message: 'Voter registered successfully. Credentials sent via email.',
      ethereumAddress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering voter', error });
    console.log(error);
  }
};

// View Registered Voters
exports.viewVoters = async (req, res) => {
  try {
    const voters = await Voter.find({}, { password: 0 }); // Exclude sensitive fields
    res.status(200).json(voters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching voters', error });
  }
};
