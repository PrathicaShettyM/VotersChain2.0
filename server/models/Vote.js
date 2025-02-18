const mongoose = require('mongoose');

const VotesSchema = new mongoose.Schema({
    electionId: { 
        type: String,  // Store as string
        required: true 
    },
    candidateId: { 
        type: String,  // Store as string
        required: true 
    },
    voterEthereumAddress: { 
        type: String,  
        required: true 
    },
    transactionHash: { 
        type: String,  
        required: true 
    },
    timestamp: { 
        type: String,  // Store timestamp as string
        default: () => new Date().toISOString() 
    }
}, { timestamps: true });

VotesSchema.index({ electionId: 1, voterEthereumAddress: 1 }, { unique: true });

const Vote = mongoose.model("Vote", VotesSchema);
module.exports = Vote;
