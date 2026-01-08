import { ConnectWalletButton } from '@tenprotocol/ten-kit';

import bgVideo from '@/assets/bg-control-room.mp4';
import bgPoster from '@/assets/bsg-bg.webp';
import PageHeader from '@/components/PageHeader/PageHeader';
import SocialShare from '@/components/SocialShare/SocialShare';
import tenLogo from '@/assets/white_logotype.png';

export default function ConnectWalletScreen() {
    return (
        <div className="fixed inset-0 overflow-auto">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                poster={bgPoster}
            >
                <source src={bgVideo} type="video/mp4" />
            </video>
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.4))',
                }}
            />
            <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                    height: '33vh',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                }}
            />
            <div className="relative min-h-screen flex flex-col">
                <div className="py-2 px-6">
                    <PageHeader />
                    <SocialShare />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h1 className="text-7xl font-bold bg-gradient-to-b from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                        BATTLESHIPS
                    </h1>
                    <h2 className="text-2xl mb-10 bg-gradient-to-b from-white via-gray-300 to-gray-400 bg-clip-text text-transparent drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                        WORLD FIRST ONCHAIN BATTLESHIPS
                    </h2>
                    <div className="text-center">
                        <ConnectWalletButton />
                    </div>

                    <div className="mt-24 flex flex-col items-center">
                        <img src={tenLogo} alt="TEN Protocol" className="h-8 mb-2" />
                        <h3>Built on TEN Protocol</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

