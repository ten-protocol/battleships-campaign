import { useSessionKeyStore } from '@tenprotocol/ten-kit';
import { Log, encodeFunctionData, parseEther, parseEventLogs } from 'viem';

import BattleshipGameJson from '@/assets/contract/artifacts/contracts/BattleshipGameTestnet.sol/BattleshipGameTestnet.json';
import { MOVE_FEE } from '@/lib/constants';

const POLL_INTERVAL = 1000; // 1 second
const MAX_POLL_ATTEMPTS = 30; // 30 seconds max wait

/**
 * Poll for HitFeedback event from the game contract.
 * The TEN protocol uses callbacks that execute at end of block,
 * so we need to poll for the event after the initial transaction.
 */
async function pollForHitFeedbackEvent(
    provider: any,
    contractAddress: string,
    fromBlock: string
): Promise<Log[]> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        try {
            // Get logs from the game contract
            const logs = await provider.request({
                method: 'eth_getLogs',
                params: [
                    {
                        address: contractAddress,
                        fromBlock: fromBlock,
                        toBlock: 'latest',
                    },
                ],
            });

            console.log('Polled logs from game contract:', logs);

            if (logs && logs.length > 0) {
                // Parse the logs using the ABI
                const parsedLogs = parseEventLogs({
                    abi: BattleshipGameJson.abi,
                    logs: logs,
                });

                // Find HitFeedback event
                const hitFeedbackLog = parsedLogs.find(
                    (log: any) => log.eventName === 'HitFeedback'
                );

                if (hitFeedbackLog) {
                    console.log('Found HitFeedback event:', hitFeedbackLog);
                    return parsedLogs;
                }
            }
        } catch (error) {
            console.error('Error polling for logs:', error);
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }

    throw new Error(
        'Timeout waiting for HitFeedback event. The callback may not have been processed yet.'
    );
}

export default async function placeHit(
    x: number,
    y: number
): Promise<{ logs: Log[]; txHash: string }> {
    const { sendTransaction, waitForReceipt, provider } = useSessionKeyStore.getState();

    const data = encodeFunctionData({
        abi: BattleshipGameJson.abi,
        functionName: 'hit',
        args: [x, y],
    });

    const txHash = await sendTransaction({
        to: import.meta.env.VITE_CONTRACT_ADDRESS,
        value: `0x${parseEther(MOVE_FEE).toString(16)}`,
        data,
    });
    const receipt = await waitForReceipt(txHash);
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    // First check if HitFeedback was emitted directly in receipt
    // (this can happen for already-hit cells where no callback is needed)
    const directLogs = parseEventLogs({
        abi: BattleshipGameJson.abi,
        logs: receipt.logs.filter(
            (log: any) => log.address.toLowerCase() === contractAddress.toLowerCase()
        ) as any,
    });

    if (directLogs.length > 0 && directLogs.some((log: any) => log.eventName === 'HitFeedback')) {
        console.log('Found direct HitFeedback logs:', directLogs);
        return { logs: directLogs, txHash };
    }

    // For new cells, the HitFeedback is emitted via TEN callback at end of block
    // Poll for the event from the game contract
    console.log('No direct HitFeedback in receipt, polling for callback event...');
    const logs = await pollForHitFeedbackEvent(provider, contractAddress, receipt.blockNumber);

    return { logs, txHash };
}
