const mongoose = require('mongoose');

const AuditTrailsSchema = new mongoose.Schema({
    transactionHash: { 
        type: String, 
        required: true,
        unique: true
    },
    transactionType: { 
        type: String, 
        required: true,
        enum: ["Vote", "Candidate Registration", "Election Creation", "Other"]
    },
    userEthereumAddress: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    additionalDetails: { 
        type: mongoose.Schema.Types.Mixed, 
        default: {}
    }
}, { timestamps: true });

const AuditTrail = mongoose.model("AuditTrail", AuditTrailsSchema);
module.exports = AuditTrail;
