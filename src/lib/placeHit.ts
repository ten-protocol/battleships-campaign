import { useSessionKeyStore } from '@tenprotocol/ten-kit';
import { Log, encodeFunctionData, parseEther, parseEventLogs } from 'viem';

import BattleshipGameJson from '@/assets/contract/artifacts/contracts/BattleshipGameTestnet.sol/BattleshipGameTestnet.json';
import { MOVE_FEE } from '@/lib/constants';

export default async function placeHit(x: number, y: number): Promise<{ logs: Log[]; txHash: string }> {
    const { sendTransaction, waitForReceipt } = useSessionKeyStore.getState();

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

    console.log('txHash', txHash);

    const receipt = await waitForReceipt(txHash);

    const logs = parseEventLogs({
        abi: BattleshipGameJson.abi,
        logs: receipt.logs as any,
    });

    return { logs, txHash };
}
