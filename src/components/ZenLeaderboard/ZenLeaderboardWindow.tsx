import { useEffect } from 'react';

import dayjs from 'dayjs';
import { useAccount } from 'wagmi';

import useZenLeaderboardMutations from '@/api/zen/zen.mutations';
import { useZenLeaderboardQuery } from '@/api/zen/zen.queries';
import Button from '@/components/Button/Button';
import HudWindow from '@/components/HudWindow/HudWindow';
import shortenAddress from '@/helpers/shortenAddress';
import { TEN_CHAIN_ID } from '@/lib/constants';
import { useGameStore } from '@/stores/gameStore';

export default function ZenLeaderboardWindow() {
    const [leaderboardWindowOpen, toggleLeaderboardWindow] = useGameStore((state) => [
        state.leaderboardWindowOpen,
        state.toggleLeaderboardWindow,
    ]);
    const { address, isConnected, chainId } = useAccount();
    const ready = address && isConnected && chainId === TEN_CHAIN_ID;

    const finalizingResults = false;

    const {
        data: leaderboardData,
        isPending: leaderboardPending,
        isError: leaderboardError,
    } = useZenLeaderboardQuery({
        enabled: !!ready,
    });

    const {
        mutate,
        data: walletLeaderboardPosition,
        isPending: walletLeaderboardPending,
        error: walletLeaderboardError,
    } = useZenLeaderboardMutations();

    useEffect(() => {
        if (ready) {
            mutate(address as string);
        }
    }, [address, isConnected, chainId]);

    if (!leaderboardWindowOpen) return null;

    const isPending = walletLeaderboardPending || leaderboardPending;

    return (
        <HudWindow
            headerTitle="ZEN Leaderboard"
            modalMode={true}
            speed={0.2}
            footerContent={
                <div className="flex justify-end">
                    <Button onClick={toggleLeaderboardWindow}>Close</Button>
                </div>
            }
        >
            {finalizingResults && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50 pointer-events-none">
                    <div className="text-white text-center">
                        <p className="text-2xl font-bold mb-4 drop-shadow-lg">Finalizing Results...</p>
                        <p className="text-lg mb-4 drop-shadow-lg">Please check back shortly. <br/>  In the meantime, you can have fun playing!</p>
                        <a
                            href="https://x.com/tenprotocol/status/1858587677534417035"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 underline hover:text-blue-500 drop-shadow-lg"
                        >
                            Read more here
                        </a>
                    </div>
                </div>
            )}
            <div className={`max-w-2xl px-6 py-2 ${finalizingResults ? 'blur-sm' : ''}`}>
                <div className="flex flex-col gap-6 lg:flex-row">
                    <div>
                        <h4 className="text-xl">Top 10 ZEN Wallets</h4>
                        {leaderboardData && (
                            <p className="text-xs mb-2">
                                Last updated:{' '}
                                {dayjs(leaderboardData.last_update).format('DD MMM HH:mm')}
                            </p>
                        )}
                        <table>
                            <thead>
                                <tr>
                                    <th className="pr-5 whitespace-nowrap">Pos.</th>
                                    <th className="pr-5 whitespace-nowrap">Wallet Address</th>
                                    <th className="pl-5 whitespace-nowrap text-right">Total ZEN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData &&
                                    leaderboardData.top10.map((leaderboardItem) => (
                                        <tr
                                            key={leaderboardItem.walletAddress}
                                            className={
                                                walletLeaderboardPosition?.position ===
                                                leaderboardItem.position
                                                    ? 'bg-white text-black'
                                                    : ''
                                            }
                                        >
                                            <td>{leaderboardItem.position}</td>
                                            <td>{leaderboardItem.walletAddress}</td>
                                            <td className="text-right">
                                                {leaderboardItem.balance}
                                            </td>
                                        </tr>
                                    ))}
                                {isPending && (
                                    <tr>
                                        <td colSpan={3} className="text-center">
                                            Loading...
                                        </td>
                                    </tr>
                                )}
                                {leaderboardError && (
                                    <tr>
                                        <td colSpan={3} className="texxt-center">
                                            Error fetching leaderboard.
                                        </td>
                                    </tr>
                                )}
                                {/*@ts-ignore*/}
                                {walletLeaderboardError?.response?.data?.error ===
                                    'Wallet address not found in leaderboard' && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="text-center p-2 bg-white text-black"
                                        >
                                            Cannot find your wallet balance.
                                        </td>
                                    </tr>
                                )}
                                {!isPending &&
                                    walletLeaderboardPosition &&
                                    walletLeaderboardPosition.position > 10 && (
                                        <tr
                                            key={walletLeaderboardPosition.walletAddress}
                                            className="bg-white text-black font-bold"
                                        >
                                            <td>{walletLeaderboardPosition.position}</td>
                                            <td>
                                                {shortenAddress(
                                                    walletLeaderboardPosition.walletAddress
                                                )}
                                            </td>
                                            <td className="text-right">
                                                {walletLeaderboardPosition.balance}
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-sm">
                        <h4 className="text-lg mb-2">Prizes</h4>
                        <table className="mb-4">
                            <tbody>
                                <tr className="pb-4">
                                    <td className="whitespace-nowrap pr-4 font-bold">
                                        $2,500 USDT
                                    </td>
                                    <td className="text-xs">1st place</td>
                                </tr>
                                <tr className="pb-4">
                                    <td className="whitespace-nowrap pr-4 font-bold">
                                        $1,500 USDT
                                    </td>
                                    <td className="text-xs">2nd place</td>
                                </tr>
                                <tr className="pb-4">
                                    <td className="whitespace-nowrap pr-4 font-bold">
                                        $1,000 USDT
                                    </td>
                                    <td className="text-xs">3rd place</td>
                                </tr>
                                <tr className="pb-4">
                                    <td className="whitespace-nowrap pr-4 font-bold align-top">
                                        $100 USDT
                                    </td>
                                    <td className="text-xs">4th-53rd</td>
                                </tr>
                                <tr className="pb-4">
                                    <td className="whitespace-nowrap pr-4 font-bold align-top">
                                        100 T-Points
                                    </td>
                                    <td className="text-xs">54th-103rd</td>
                                </tr>
                                <tr className="pb-4">
                                    <td className="whitespace-nowrap pr-4 font-bold align-top">
                                        50 T-Points
                                    </td>
                                    <td className="text-xs">104th-353rd</td>
                                </tr>
                                <tr className="pb-4">
                                    <td className="whitespace-nowrap pr-4 font-bold align-top">
                                        25 T-Points
                                    </td>
                                    <td className="text-xs">354th-1353rd</td>
                                </tr>
                            </tbody>
                        </table>
                        {/*@ts-ignore*/}
                        {!walletLeaderboardError?.response?.data?.error && (
                        <p
                            className={`p-2 text-sm text-black ${
                                walletLeaderboardPosition?.isFlagged ? 'bg-red-600' : 'bg-green-600'
                            }`}
                        >
                            {walletLeaderboardPosition?.isFlagged ? (
                                <>Your account has been flagged!</>
                            ) : (
                                <>
                                    Congratulations, you finished the competition in
                                    {` ${walletLeaderboardPosition?.position}th place`} and won <strong>{walletLeaderboardPosition?.prize}</strong>!
                                    <br/><br/>We will distribute the prizes very soon, stay tuned to Discord for updates!
                                </>
                            )}
                        </p>
                    )}
                    </div>
                </div>
            </div>
        </HudWindow>
    );
}
