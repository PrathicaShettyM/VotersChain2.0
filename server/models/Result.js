const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ResultSchema = new mongoose.Schema({
    resultId: { 
        type: String, 
        default: uuidv4, 
        unique: true 
    },
    electionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Election", 
        required: true 
    },
    candidateId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Candidate", 
        required: true 
    },
    votesReceived: { 
        type: Number, 
        default: 0 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

ResultSchema.index({ electionId: 1, candidateId: 1 }, { unique: true });

const Result = mongoose.model("Result", ResultSchema);
module.exports = Result;
