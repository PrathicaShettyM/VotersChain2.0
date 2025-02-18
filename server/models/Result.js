const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    electionId: {
        type: String,
        required: true,
        trim: true
    },
    candidateId: {
        type: Number,
        required: true
    },
    votesCount: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
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