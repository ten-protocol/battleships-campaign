const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚢 Starting BattleshipGameTestnet deployment to TEN protocol...\n");

  // Get deployment configuration from environment or use defaults
  const TEN_CALLBACKS_ADDRESS = process.env.TEN_CALLBACKS_ADDRESS || "0x0000000000000000000000000000000000000002";
  const GRID_SIZE = parseInt(process.env.GRID_SIZE || "10");
  const TOTAL_SHIPS = parseInt(process.env.TOTAL_SHIPS || "10");

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
  console.log("TEN Callbacks Address:", TEN_CALLBACKS_ADDRESS);
  console.log("Grid Size:", GRID_SIZE, `(${GRID_SIZE}x${GRID_SIZE} = ${GRID_SIZE * GRID_SIZE} cells)`);
  console.log("Total Ships:", TOTAL_SHIPS);
  console.log();

  // Deploy BattleshipGameTestnet contract
  console.log("📦 Deploying BattleshipGameTestnet contract...");
  const BattleshipGame = await ethers.getContractFactory("BattleshipGameTestnet");
  const battleshipGame = await BattleshipGame.deploy(
    TEN_CALLBACKS_ADDRESS,
    GRID_SIZE,
    TOTAL_SHIPS
  );
  await battleshipGame.waitForDeployment();
  const gameAddress = await battleshipGame.getAddress();
  console.log("✅ BattleshipGameTestnet deployed to:", gameAddress);

  // Verify deployment by reading game info
  const [gameOver, gridSize, totalShips] = await battleshipGame.gameInfo();
  console.log("\n🎮 Game Configuration Verified:");
  console.log("  Grid Size:", gridSize.toString());
  console.log("  Total Ships:", totalShips.toString());
  console.log("  Game Over:", gameOver);

  // Read reward values from contract
  const hitReward = await battleshipGame.hitReward();
  const sinkReward = await battleshipGame.sinkReward();
  const finalSinkReward = await battleshipGame.finalSinkReward();
  const totalShipCells = await battleshipGame.totalShipCells();

  console.log("\n💰 ETH Reward Configuration:");
  console.log("  Hit Reward:", ethers.formatEther(hitReward), "ETH");
  console.log("  Sink Reward:", ethers.formatEther(sinkReward), "ETH");
  console.log("  Final Sink Reward:", ethers.formatEther(finalSinkReward), "ETH");
  console.log("  Total Ship Cells:", totalShipCells.toString());

  // Create deployment info object
  const deploymentInfo = {
    network: "ten-testnet",
    chainId: 8443,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      BattleshipGameTestnet: {
        address: gameAddress,
        transactionHash: battleshipGame.deploymentTransaction()?.hash,
        blockNumber: await ethers.provider.getBlockNumber(),
      },
    },
    configuration: {
      tenCallbacksAddress: TEN_CALLBACKS_ADDRESS,
      gridSize: GRID_SIZE,
      totalShips: TOTAL_SHIPS,
    },
  };

  // Display contract addresses for .env file
  console.log("\n📝 Environment Variables for .env:");
  console.log("===================================");
  console.log(`VITE_CONTRACT_ADDRESS=${gameAddress}`);
  console.log(`TEN_CALLBACKS_ADDRESS=${TEN_CALLBACKS_ADDRESS}`);

  // Display summary
  console.log("\n🎉 Deployment Summary:");
  console.log("====================");
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Chain ID: ${deploymentInfo.chainId}`);
  console.log(`Deployer: ${deploymentInfo.deployer}`);
  console.log(`BattleshipGameTestnet: ${gameAddress}`);
  console.log(`Transaction Hash: ${deploymentInfo.contracts.BattleshipGameTestnet.transactionHash}`);
  console.log(`Block Number: ${deploymentInfo.contracts.BattleshipGameTestnet.blockNumber}`);

  // Calculate estimated ETH required for prize pool
  const expectedPlays = (GRID_SIZE * GRID_SIZE) / 2;
  const MOVE_FEE = 0.00443; // ETH
  const expectedFees = expectedPlays * MOVE_FEE;
  const prizePool = expectedFees * 0.8; // 80% of fees go to prize pool

  console.log("\n💎 Prize Pool Economics:");
  console.log("========================");
  console.log(`Move Fee: ${MOVE_FEE} ETH`);
  console.log(`Expected plays (50% of grid): ${expectedPlays}`);
  console.log(`Expected fees: ~${expectedFees.toFixed(4)} ETH`);
  console.log(`Prize pool (80%): ~${prizePool.toFixed(4)} ETH`);
  console.log(`House edge (20%): ~${(expectedFees * 0.2).toFixed(4)} ETH`);

  console.log("\n📚 Next Steps:");
  console.log("1. Copy the contract address to your .env file");
  console.log("2. Fund the contract with ETH for prize payouts:");
  console.log(`   - Send at least ${prizePool.toFixed(4)} ETH to ${gameAddress}`);
  console.log("3. Update your frontend VITE_CONTRACT_ADDRESS");
  console.log("4. Build and deploy your frontend");

  console.log("\n✨ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
