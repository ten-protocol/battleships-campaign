import { useAccount } from 'wagmi';

import ShipFresh from '@/assets/shipFresh.svg';
import ShipSunk from '@/assets/shipSunk.svg';
import HudWindow from '@/components/HudWindow/HudWindow';
import { useContractStore } from '@/stores/contractStore';

export default function Graveyard() {
    const [graveyard, totalShips] = useContractStore((state) => [
        state.graveyard,
        state.totalShips,
    ]);
    const { isConnected } = useAccount();
    const fleetHealth = graveyard !== null ? 100 - (graveyard / totalShips) * 100 : 0;
    const unknownState = graveyard === null;
    const graveyardShips = !unknownState
        ? Array<boolean>(totalShips)
              .fill(false)
              .map((_, i) => i < graveyard)
        : [];

    const Footer = (
        <div className="text-right">
            <h3 className="text-sm whitespace-nowrap">Fleet Strength</h3>
            <p className="text-xl whitespace-nowrap">
                {unknownState ? '???' : fleetHealth.toFixed(1)}% PERC
            </p>
            {!unknownState && (
                <div className="h-2 bg-zinc-400 mt-2">
                    <div className="h-2 bg-zinc-950" style={{ width: fleetHealth + '%' }} />
                </div>
            )}

            <p className="text-3xl mt-5 whitespace-nowrap font-bold">
                {unknownState ? '???' : totalShips - graveyard}/{unknownState ? '???' : totalShips}
            </p>
            <h3 className="text-sm whitespace-nowrap">Ships remaining</h3>
        </div>
    );

    return (
        <HudWindow
            headerTitle="Enemy Fleet"
            isOpen={isConnected}
            footerContent={Footer}
            closedContent={<p className="text-center">Initialization Required</p>}
        >
            {unknownState ? (
                <h3 className="text-lg text-center my-3">No Data</h3>
            ) : (
                <div className="grid grid-cols-10 gap-1 my-2">
                    {graveyardShips.map((ship, i) => (
                        <img
                            key={i}
                            src={ship ? ShipSunk : ShipFresh}
                            alt="Logo"
                            width="20"
                            height="10"
                        />
                    ))}
                </div>
            )}
        </HudWindow>
    );
}
