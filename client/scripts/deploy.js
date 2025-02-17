import hre from "hardhat";

async function main() {
  const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
  const votingSystem = await hre.ethers.deployContract("VotingSystem"); // Corrected line
  await votingSystem.waitForDeployment(); // Corrected line

  console.log("VotingSystem deployed to:", votingSystem.target); // Corrected line
  // Or use:
  // console.log("VotingSystem deployed to:", await votingSystem.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
