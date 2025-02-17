const AuditTrail = require("../models/AuditTrail");
const Vote = require("../models/Vote");
const Result = require("../models/Result");

exports.processVoterData = async (req, res) => {
    try {
        const { auditData, voteData, resultData } = req.body;

        /** Store Audit Trail */
        if (auditData) {
            await new AuditTrail({
                transactionHash: auditData.transactionHash,
                transactionType: auditData.transactionType,
                userEthereumAddress: auditData.userEthereumAddress,
                additionalDetails: auditData.additionalDetails
            }).save();
        }

        /** Store Vote */
        if (voteData) {
            try {
                await new Vote({
                    electionId: voteData.electionId,
                    candidateId: voteData.candidateId,
                    voterEthereumAddress: voteData.voterEthereumAddress
                }).save();
            } catch (error) {
                if (error.code === 11000) { // Unique constraint error
                    return res.status(400).json({ success: false, message: "Voter has already voted in this election!" });
                }
                throw error;
            }
        }

        /** Store Election Result */
        if (resultData) {
            await new Result({
                electionId: resultData.electionId,
                candidateId: resultData.candidateId,
                votesCount: resultData.votesCount
            }).save();
        }

        res.status(201).json({ success: true, message: "Data stored successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error storing data", error });
    }
};
