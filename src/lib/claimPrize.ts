import {ethers} from "ethers";
import BattleshipGameJson from "@/assets/contract/artifacts/contracts/BattleshipGame.sol/BattleshipGame.json";
import {JsonRpcSigner} from "ethers/lib.commonjs/providers/provider-jsonrpc";

export default async function claimPrize (address: string, signer: JsonRpcSigner) {
    const contract = new ethers.Contract(
        address,
        BattleshipGameJson.abi,
        signer
    );

    try {
        const submitTx = await contract.claimReward();

        console.log("TEST", submitTx);
        return submitTx

    } catch (error) {
        console.error(error);
    }
}