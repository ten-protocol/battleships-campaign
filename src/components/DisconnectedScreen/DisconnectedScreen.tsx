import { ConnectWalletButton } from '@tenprotocol/ten-kit';
import { useAccount } from 'wagmi';

import AnimatedText from '@/components/AnimatedText/AnimatedText';
import { GATEWAY_URL, TEN_CHAIN_ID } from '@/lib/constants';

type Props = {
    contractError: boolean;
};

export default function DisconnectedScreen({ contractError }: Props) {
    const { address, chainId } = useAccount();

    return (
        <div className="text-center w-screen max-w-full">
            <div className="p-8">
                <p className="text-2xl mb-8">System Initialization Required</p>

                {address && chainId !== TEN_CHAIN_ID && (
                    <p className="text-center text-xl -mt-4 mb-4">
                        You're connected to the incorrect chain
                    </p>
                )}

                {contractError && (
                    <div className="flex flex-col justify-center p-2 bg-red-900 mb-2">
                        <p className="text-md">
                            Error fetching game info from contract. Please visit{' '}
                            <a
                                href={GATEWAY_URL}
                                target="_blank"
                                className="underline hover:underline"
                            >
                                the gateway
                            </a>{' '}
                            and reconnect.
                        </p>
                    </div>
                )}

                <div className="flex flex-col justify-center p-4">
                    <div className="flex flex-col justify-center items-center">
                        <img src="/ten-orb.webp" className="max-w-[300px]" />
                        <ConnectWalletButton />
                    </div>
                </div>

                <p className="text-sm my-6">
                    <AnimatedText
                        text="Awaiting establishment of connection to primary nexus. Standby mode activated."
                        delay={3}
                        speed={0.05}
                    />
                </p>
                <p className="text-sm mt-6">
                    <AnimatedText
                        text="Initiate diagnostic protocol 001. All units remain on high alert and prepare for potential engagement upon connection."
                        delay={7}
                        speed={0.05}
                    />
                </p>
            </div>
        </div>
    );
}
