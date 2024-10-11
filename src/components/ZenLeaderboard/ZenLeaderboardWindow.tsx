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
            <div className="max-w-2xl px-6 py-2">
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
                                            Cannot find your wallet balance. Check back in 24hrs.
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
                                        $5,000 USDT
                                    </td>
                                    <td className="text-xs">
                                        split among the next 15 and random players.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p>Lots of T-points available too!</p>
                    </div>
                </div>
            </div>
        </HudWindow>
    );
}
