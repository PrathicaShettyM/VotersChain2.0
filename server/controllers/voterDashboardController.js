const AuditTrail = require("../models/AuditTrail");
const Vote = require("../models/Vote");
const Result = require("../models/Result");

const processVoterData = async (req, res) => {
    try {
        const { auditData, voteData, resultData } = req.body;

        // Validate required data
        if (!auditData || !voteData) {
            return res.status(400).json({
                success: false,
                message: "Missing required data fields"
            });
        }

        // First check if voter has already voted to fail fast
        const existingVote = await Vote.findOne({
            electionId: voteData.electionId,
            voterEthereumAddress: voteData.voterEthereumAddress
        });

        if (existingVote) {
            return res.status(400).json({
                success: false,
                message: "Voter has already voted in this election!"
            });
        }

        // Store Audit Trail
        await new AuditTrail({
            transactionHash: auditData.transactionHash,
            transactionType: auditData.transactionType,
            userEthereumAddress: auditData.userEthereumAddress,
            additionalDetails: auditData.additionalDetails,
            timestamp: new Date()
        }).save();

        // Store Vote
        await new Vote({
            electionId: voteData.electionId,
            candidateId: voteData.candidateId,
            voterEthereumAddress: voteData.voterEthereumAddress,
            timestamp: new Date()
        }).save();

        // Update or Create Election Result
        if (resultData) {
            await Result.findOneAndUpdate(
                {
                    electionId: resultData.electionId,
                    candidateId: resultData.candidateId
                },
                {
                    $set: {
                        votesCount: resultData.votesCount,
                        lastUpdated: new Date()
                    }
                },
                { upsert: true, new: true }
            );
        }

        res.status(201).json({
            success: true,
            message: "Vote recorded successfully!",
            data: {
                electionId: voteData.electionId,
                candidateId: voteData.candidateId,
                transactionHash: auditData.transactionHash
            }
        });

    } catch (error) {
        console.error('Error in processVoterData:', error);
        
        // Handle duplicate key error explicitly
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Voter has already voted in this election!"
            });
        }
    }
};

module.exports = {
    processVoterData
};