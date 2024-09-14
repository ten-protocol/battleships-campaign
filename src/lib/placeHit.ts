import { getTransactionReceipt, watchContractEvent, writeContract } from '@wagmi/core';
import { Log, parseEther } from 'viem';

import BattleshipGameJson from '@/assets/contract/artifacts/contracts/BattleshipGameTestnet.sol/BattleshipGameTestnet.json';
import { MOVE_FEE } from '@/lib/constants';
import { wagmiConfig } from '@/main';

export default function placeHit(x: number, y: number): Promise<{ logs: Log[]; txHash: string }> {
    return new Promise((resolve, reject) => {
        let txHash = '';
        const unwatch = watchContractEvent(wagmiConfig, {
            address: import.meta.env.VITE_CONTRACT_ADDRESS,
            abi: BattleshipGameJson.abi,
            eventName: 'HitFeedback',
            onLogs(logs) {
                unwatch();
                resolve({
                    txHash,
                    logs,
                });
            },
            pollingInterval: 2_00,
        });

        writeContract(wagmiConfig, {
            abi: BattleshipGameJson.abi,
            address: import.meta.env.VITE_CONTRACT_ADDRESS,
            functionName: 'hit',
            args: [x, y],
            value: parseEther(MOVE_FEE),
        })
            .then((transactionHash) => {
                txHash = transactionHash;
                const intervalId = setInterval(async () => {
                    try {
                        await getTransactionReceipt(wagmiConfig, {
                            hash: transactionHash,
                        });
                        clearInterval(intervalId);
                    } catch (error) {}
                }, 500);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
