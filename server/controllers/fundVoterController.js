require("dotenv").config();
const { ethers } = require("ethers");
const Voter = require("../models/Voter"); // Assuming your Mongoose Voter model

// Fund all the voters 1000 Test Ethers
// Connect to Hardhat's local blockchain
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

async function fundVoters() {
  try {
    // Fetch all voter Ethereum addresses from the database
    const voters = await Voter.find({}, "ethereumAddress");

    if (!voters.length) {
      console.log("❌ No voters found.");
      return;
    }

    // Get the first Hardhat account (rich with ETH)
    const signer = await provider.getSigner(0); // Correct way in Ethers v6

    console.log("💰 Funding voters using:", await signer.getAddress());

    for (const voter of voters) {
      try {
        const tx = await signer.sendTransaction({
          to: voter.ethereumAddress,
          value: ethers.parseEther("1000"), // 1000 ETH
        });
        await tx.wait();
        console.log(`✅ Sent 1000 ETH to ${voter.ethereumAddress}`);
      } catch (error) {
        console.error(`❌ Failed to send ETH to ${voter.ethereumAddress}:`, error);
      }
    }

    console.log("🎉 Funding process complete!");
  } catch (error) {
    console.error("⚠️ Error in funding voters:", error);
  }
}

// Run function on startup automatically
fundVoters();

module.exports = fundVoters;
