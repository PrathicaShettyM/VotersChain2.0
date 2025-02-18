const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    electionId: {
        type: String,
        required: true,
        trim: true
    },
    candidateId: {
        type: String,  // Store candidateId as string
        required: true
    },
    votesCount: {
        type: String,  // Store votesCount as string
        required: true,
        default: '0'
    },
    lastUpdated: {
        type: String,  // Store timestamp as string
        default: () => new Date().toISOString()
    }
}, {
    timestamps: true
});

// Create a compound unique index for election and candidate
resultSchema.index({ 
    electionId: 1, 
    candidateId: 1 
}, { 
    unique: true 
});

// Create additional indexes for querying
resultSchema.index({ electionId: 1 });
resultSchema.index({ lastUpdated: 1 });

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;
