const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🪙 Starting ZENToken deployment to TEN protocol...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.log(
      "⚠️  Warning: Account has no ETH. Make sure to fund your account before deploying.",
    );
  }

  console.log("📋 Deployment Configuration:");
  console.log("============================");
  console.log("Token Name: ZEN Token");
  console.log("Token Symbol: ZEN");
  console.log("Initial Admin:", deployer.address);
  console.log();

  // Deploy ZENToken contract
  console.log("📦 Deploying ZENToken contract...");
  const ZENToken = await ethers.getContractFactory("ZENToken");
  const zenToken = await ZENToken.deploy();
  await zenToken.waitForDeployment();
  const tokenAddress = await zenToken.getAddress();
  console.log("✅ ZENToken deployed to:", tokenAddress);

  // Verify the deployer is set as admin
  const isAdmin = await zenToken.admins(deployer.address);
  console.log("✅ Deployer is admin:", isAdmin);

  // Create deployment info object
  const deploymentInfo = {
    network: "ten-testnet",
    chainId: 8443,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ZENToken: {
        address: tokenAddress,
        transactionHash: zenToken.deploymentTransaction()?.hash,
        blockNumber: await ethers.provider.getBlockNumber(),
      },
    },
  };

  // Display contract addresses for .env file
  console.log("\n📝 Environment Variables for .env:");
  console.log("===================================");
  console.log(`ZEN_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(
    "\n💡 Copy this address to your .env file.",
  );

  // Display summary
  console.log("\n🎉 Deployment Summary:");
  console.log("====================");
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Chain ID: ${deploymentInfo.chainId}`);
  console.log(`Deployer: ${deploymentInfo.deployer}`);
  console.log(`ZENToken: ${tokenAddress}`);
  console.log(`Transaction Hash: ${deploymentInfo.contracts.ZENToken.transactionHash}`);
  console.log(`Block Number: ${deploymentInfo.contracts.ZENToken.blockNumber}`);
  console.log("\n✨ Deployment completed successfully!");

  console.log("\n📚 Next Steps:");
  console.log("1. Copy the contract address to your .env file");
  console.log("2. Add the ZENToken as admin to any contracts that need minting access");
  console.log("3. Use the mint() function to distribute tokens as needed");

  // Optional: Verify contracts if TEN supports verification
  console.log(
    "\n🔍 Note: Contract verification on TEN protocol may require manual verification through their explorer.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

