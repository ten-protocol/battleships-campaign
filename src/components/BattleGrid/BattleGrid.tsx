import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

import BattleGridEdgeArrows from '@/components/BattleGrid/BattleGridEdgeArrows';
import DisconnectedScreen from '@/components/DisconnectedScreen/DisconnectedScreen';
import HudWindow from '@/components/HudWindow/HudWindow';
import { TEN_CHAIN_ID } from '@/lib/constants';

import BattleGridContainer from './BattleGridContainer';
import BattleGridCurrentCoordinates from './BattleGridCurrentCoordinates';

export default function BattleGrid() {
    const { isConnected, chainId } = useAccount();
    const [displayGrid, setDisplayGrid] = useState(false);
    const connectedToTen = chainId === TEN_CHAIN_ID && isConnected;

    useEffect(() => {
        if (connectedToTen) {
            setTimeout(() => {
                setDisplayGrid(true);
            }, 3000);
        }
    }, [isConnected, chainId]);

    const animation = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { delay: 0, duration: 1 },
    };

    return (
        <HudWindow
            headerTitle="Battle Grid"
            isOpen={connectedToTen}
            closedContent={<DisconnectedScreen />}
        >
            <div className="w-screen max-w-full" style={{ height: 524 }}>
                {displayGrid ? (
                    <motion.div {...animation}>
                        <BattleGridEdgeArrows />
                        <BattleGridContainer />
                        <BattleGridCurrentCoordinates />
                    </motion.div>
                ) : (
                    <p>Loading Grid.</p>
                )}
            </div>
        </HudWindow>
    );
}
