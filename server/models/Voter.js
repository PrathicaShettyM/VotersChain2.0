const mongoose = require('mongoose');

const VoterSchema = new mongoose.Schema({
  ethereumAddress: { 
    type: String,
    unique: true 
    },
  name: { 
    type: String, 
    required: true 
    },
  email: { 
    type: String, 
    required: true, 
    unique: true 
    },
  phoneNumber: { 
    type: String,
    required: true
    },
  dateOfBirth: { 
    type: Date,
    required: true
    },
  password: { 
    type: String,
    required: true
    },
  isRegistered: { 
    type: Boolean, 
    default: false 
    },
  createdAt: { 
    type: Date, 
    default: Date.now 
},
});

const Voter = mongoose.model('Voter', VoterSchema);
module.exports = Voter;
