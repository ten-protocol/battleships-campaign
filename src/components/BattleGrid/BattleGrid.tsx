import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useAccount, useReadContract } from 'wagmi';
import { useShallow } from 'zustand/react/shallow';

import BattleshipGameJson from '@/assets/contract/artifacts/contracts/BattleshipGameTestnet.sol/BattleshipGameTestnet.json';
import SocialShare from '@/components/SocialShare/SocialShare';
import { TEN_CHAIN_ID } from '@/lib/constants';
import { useContractStore } from '@/stores/contractStore';

import BattleGridContainer from './BattleGridContainer';
import BattleGridCurrentCoordinates from './BattleGridCurrentCoordinates';

export default function BattleGrid() {
    const { isConnected, chainId } = useAccount();
    const [gameInit, gameOver] = useContractStore(
        useShallow((state) => [state.gameInit, state.gameOver])
    );
    const [displayGrid, setDisplayGrid] = useState(false);
    const connectedToTen = chainId === TEN_CHAIN_ID && isConnected;

    const {
        data: gameInfo,
        isError,
        error,
        isSuccess,
    } = useReadContract({
        abi: BattleshipGameJson.abi,
        address: import.meta.env.VITE_CONTRACT_ADDRESS,
        functionName: 'gameInfo',
        query: {
            enabled: connectedToTen,
            retry: false,
        },
    });

    if (isError) {
        console.error(`Error fetching game info: ${error.message}`);
    }

    useEffect(() => {
        if (isSuccess && gameInfo && !displayGrid) {
            //TODO: Revisit
            //@ts-ignore
            gameInit(...gameInfo);
            setDisplayGrid(true);
        }
    }, [isSuccess, isError]);

    const animation = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { delay: 0, duration: 1 },
    };

    return (
        <div>
            {gameOver ? (
                <div className="text-center flex flex-col gap-4 mx-6">
                    <h2 className="text-2xl my-4">THE GAME HAS ENDED</h2>
                    <p>
                        This instance of Battleships has ended but keep a look out for future games.
                    </p>
                    <p>
                        <a
                            href="https://twitter.com/intent/user?screen_name=tenprotocol"
                            target="_blank"
                            className="text-white font-extrabold underline"
                        >
                            Follow us
                        </a>{' '}
                        on X for future announcements and chances to win ZEN tokens.
                    </p>
                    <div className="flex flex-col items-center">
                        <p>Had fun? Tell your frens!</p>
                        <SocialShare />
                    </div>
                </div>
            ) : (
                <div className="w-full h-full">
                    {displayGrid ? (
                        <motion.div {...animation} className="w-full h-full">
                            <BattleGridContainer />
                            <BattleGridCurrentCoordinates />
                        </motion.div>
                    ) : (
                        <p>Loading Grid.</p>
                    )}
                </div>
            )}
        </div>
    );
}
