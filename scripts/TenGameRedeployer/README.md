# TenGameRedeployer

This folder contains scripts and utilities for deploying and managing the **BattleshipGame** and **TenZen** smart contracts. It is designed to automate the process of deploying these two contracts, handling notifications, and interacting with related services.

## Purpose

- **Automated Deployment:** Deploy or catch up with a single instance of both the BattleshipGame and TenZen contracts for testing or production.
- **Integration:** Includes utilities for Discord notifications, faucet management, and Vercel deployment hooks.
- **Contract Management:** Handles contract addresses and ABI files for seamless integration with frontends or other services.

## Structure

- `main.py` — Main entry point for deployment logic.
- `src/contracts/` — Contains Solidity contracts and their ABIs.
- `DiscordNotifier.py` — Sends notifications to Discord channels.
- `Faucet.py` — Manages testnet token faucets.
- `Redeployer.py` — Core logic for contract deployment and address management.
- `Utils.py` — Helper utilities.
- `Vercel.py` — Handles Vercel deployment hooks.

## Usage

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt  # if requirements.txt is present
   # or use npm/yarn if using Node.js for JS/TS scripts
   ```

2. **Set environment variables:**
   - You must provide the required environment variables (such as existing contract addresses for BattleshipGame and TenZen) to avoid deploying new contracts from scratch.
   - **WARNING:**
     - If the required environment variables are **not** set, the script will deploy new contracts from scratch.
     - **DO NOT RUN** the redeployer without setting these variables if there are already games running, as this will overwrite or duplicate deployments.
     - If you fill in the contract addresses, the script will catch up and use the existing contracts instead of redeploying.

3. **Run the redeployer:**
   ```bash
   python main.py
   # or use the appropriate command for your environment
   ```

## Important Warning

> **If the environment is not fulfilled (i.e., required contract addresses are missing), the script will deploy contracts from scratch.**
>
> **DO NOT DO SO if games are already running!**
>
> To catch up with existing deployments, fill in the contract addresses in the environment variables before running the script.