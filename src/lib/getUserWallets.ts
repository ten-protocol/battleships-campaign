import { getConnectors } from '@wagmi/core';

import { wagmiConfig } from '@/main';

export default function getWalletUserWallets(): string[] {
    const connectors = getConnectors(wagmiConfig);
    return connectors.map((connector) => connector.name);
}
