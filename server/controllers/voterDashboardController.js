const AuditTrail = require("../models/AuditTrail");
const Vote = require("../models/Vote");
const Result = require("../models/Result");

const processVoterData = async (req, res) => {
    try {
        const { auditData, voteData, resultData } = req.body;

        if (!auditData || !voteData) {
            return res.status(400).json({ success: false, message: "Missing required data fields" });
        }

        const existingVote = await Vote.findOne({
            electionId: String(voteData.electionId),
            voterEthereumAddress: String(voteData.voterEthereumAddress)
        });

        if (existingVote) {
            return res.status(400).json({ success: false, message: "Voter has already voted!" });
        }

        await new AuditTrail(auditData).save();

        await new Vote({
            electionId: String(voteData.electionId || '1'),
            candidateId: String(voteData.candidateId || '0'),
            voterEthereumAddress: String(voteData.voterEthereumAddress || '0x24374820h26jmud7a93071l'),
            transactionHash: String(auditData.transactionHash || '0x0nax82n1ibamcujenacoac08unnoyeb9djna152F5281Bhsu20')
        }).save();

        if (resultData) {
            await Result.findOneAndUpdate(
                {
                    electionId: String(resultData.electionId || '1'),
                    candidateId: String(resultData.candidateId || '0')
                },
                {
                    $set: {
                        votesCount: String(resultData.votesCount || '0'),
                        lastUpdated: new Date().toISOString()
                    }
                },
                { upsert: true, new: true }
            );
        }

        res.status(201).json({ success: true, message: "Vote recorded successfully!" });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
};

module.exports = { Result, processVoterData };
