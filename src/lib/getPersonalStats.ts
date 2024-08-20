import { ethers } from 'ethers';
import { JsonRpcSigner } from 'ethers/lib.commonjs/providers/provider-jsonrpc';

import BattleshipGameJson from '@/assets/contract/artifacts/contracts/BattleshipGame.sol/BattleshipGame.json';

export default async function getPersonalStats(address: string, signer: JsonRpcSigner) {
    const contract = new ethers.Contract(address, BattleshipGameJson.abi, signer);

    try {
        const submitTx = await contract.getPersonalStats();

        return submitTx;
    } catch (error) {
        console.error(error);
    }
}
