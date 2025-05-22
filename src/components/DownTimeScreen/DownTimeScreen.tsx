'use client';

import { FaDiscord, FaGithub, FaTelegram } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';

import Button from '@/components/Button/Button';
import HudWindow from '@/components/HudWindow/HudWindow';

export default function DownTimeScreen() {
    return (
        <div>
            <div className="flex flex-col flex-grow items-center justify-center gap-8 p-4">
                <div className="lg:w-1/2 lg:max-w-screen-sm flex flex-col gap-8"></div>
                <div>
                    <HudWindow headerTitle="PUBLIC NOTICE">
                        <div className="flex flex-col justify-center text-center max-w-[850px] mt-8">
                            <h1 className="text-3xl font-bold mb-4">Paused Until Final Chapter</h1>
                            <div className="flex flex-col gap-6">
                                <p>
                                    Chapter One is officially closed. Every interaction has been
                                    recorded and counted toward eligibility.
                                </p>

                                <p>
                                    All testnet dapps are now offline. This marks the line between
                                    what counted and what’s still to come.
                                </p>

                                <p>The Final Chapter is next. And it changes everything.</p>
                                <p>
                                    We’ll be back in the upcoming two weeks with the Final Chapter.
                                </p>
                                <p>
                                    For updates, keep an eye on{' '}
                                    <a className="underline" href="https://ten.xyz">
                                        ten.xyz
                                    </a>{' '}
                                    and{' '}
                                    <a className="underline" href="https://x.com/tenprotocol">
                                        @tenprotocol
                                    </a>{' '}
                                    on X.
                                </p>
                            </div>

                            <div className="flex gap-2 mt-6 items-center justify-center">
                                {import.meta.env.VITE_BLOG_LINK && (
                                    <a href={import.meta.env.VITE_BLOG_LINK ?? ''}>
                                        <Button variant="light">Read More On Distribution</Button>
                                    </a>
                                )}

                                <a href="https://airdrop.ten.xyz/">
                                    <Button variant="light">Check Your Eligibility</Button>
                                </a>
                            </div>

                            <div className="flex gap-6 mt-8 justify-center">
                                <a href="https://twitter.com/tenprotocol" target="_blank">
                                    <RiTwitterXFill size={24} />
                                </a>
                                <a href="https://discord.gg/tenprotocol" target="_blank">
                                    <FaDiscord size={24} />
                                </a>
                                <a href="https://t.me/tenprotocol" target="_blank">
                                    <FaTelegram size={24} />
                                </a>
                                <a href="https://github.com/ten-protocol" target="_blank">
                                    <FaGithub size={24} />
                                </a>
                            </div>
                        </div>
                    </HudWindow>
                </div>
            </div>
        </div>
    );
}
