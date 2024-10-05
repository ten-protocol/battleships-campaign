import { getTransactionReceipt, writeContract } from '@wagmi/core';
import { Log, parseEther, parseEventLogs } from 'viem';

import BattleshipGameJson from '@/assets/contract/artifacts/contracts/BattleshipGameTestnet.sol/BattleshipGameTestnet.json';
import { MOVE_FEE } from '@/lib/constants';
import { wagmiConfig } from '@/main';

export default function placeHit(x: number, y: number): Promise<{ logs: Log[]; txHash: string }> {
    return new Promise((resolve, reject) => {
        writeContract(wagmiConfig, {
            abi: BattleshipGameJson.abi,
            address: import.meta.env.VITE_CONTRACT_ADDRESS,
            functionName: 'hit',
            args: [x, y],
            value: parseEther(MOVE_FEE),
        })
            .then(async (txHash) => {
                const intervalId = setInterval(async () => {
                    try {
                        const receipt = await getTransactionReceipt(wagmiConfig, {
                            hash: txHash,
                        });
                        const logs = parseEventLogs({
                            abi: BattleshipGameJson.abi,
                            logs: receipt.logs,
                        });
                        resolve({
                            logs,
                            txHash,
                        });
                        clearInterval(intervalId);
                    } catch (error) {}
                }, 400);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
