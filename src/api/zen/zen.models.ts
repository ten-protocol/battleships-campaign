export type ZenLeaderboardItem = {
    position: number;
    walletAddress: string;
    balance: number;
};

export type ZenLeaderboard = ZenLeaderboardItem[];

export type ZenLeaderboardResponse = {
    last_update: string;
    top10: ZenLeaderboard;
};

export type ZenLeaderboardWalletPositionResponse = ZenLeaderboardItem & {
    prize: string;
};
