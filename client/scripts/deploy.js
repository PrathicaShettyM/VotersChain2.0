import hre from "hardhat";

async function main() {
  const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
  const votingSystem = await hre.ethers.deployContract("VotingSystem");
  await votingSystem.waitForDeployment();

  console.log("VotingSystem deployed to:", votingSystem.target);
  
  // Optional: Print more deployment details
  console.log("Deployment transaction hash:", votingSystem.deploymentTransaction()?.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});