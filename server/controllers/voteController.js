const Voter = require("../models/Voter");
const Election = require("../models/Election");

exports.getVoterDashboard = async (req, res) => {
  try {
    const voter = await Voter.findOne({ _id: req.user.id });
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    const elections = await Election.find().populate("candidates");

    res.json({ voter, elections });
  } catch (error) {
    console.error("Error fetching voter dashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.vote = async (req, res) => {
  try {
    const { electionId, candidateId, voterEthAddr } = req.body;

    if (!electionId || !candidateId || !voterEthAddr) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify election and candidate exist
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    const candidate = election.candidates.find(c => c._id.toString() === candidateId);
    if (!candidate) return res.status(404).json({ message: "Candidate not found in this election" });

    // (Optional: Store vote in DB if needed)

    res.json({ message: "Vote submitted successfully" });
  } catch (error) {
    console.error("Error submitting vote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
