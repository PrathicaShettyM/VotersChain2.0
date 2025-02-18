const mongoose = require('mongoose');

const auditTrailSchema = new mongoose.Schema({
    transactionHash: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    transactionType: {
        type: String,
        required: true,
        enum: ['Vote', 'CreateElection', 'UpdateElection', 'Other']
    },
    userEthereumAddress: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    additionalDetails: {
        type: String,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create indexes
auditTrailSchema.index({ transactionHash: 1 });
auditTrailSchema.index({ userEthereumAddress: 1 });

const AuditTrail = mongoose.model('AuditTrail', auditTrailSchema);
module.exports = AuditTrail;