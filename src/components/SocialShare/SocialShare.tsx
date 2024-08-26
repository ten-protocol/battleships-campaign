/// <reference types="vite-plugin-svgr/client" />
import FacebookIcon from '@/assets/social/facebookIcon.svg?react';
import TelegramIcon from '@/assets/social/telegramIcon.svg?react';
import WhatsappIcon from '@/assets/social/whatsappIcon.svg?react';
import XIcon from '@/assets/social/xIcon.svg?react';

export default function SocialShare() {
    const siteUrl = import.meta.env.VITE_SITE_URL;

    return (
        <div className="flex flex-row gap-4 sm:justify-end my-5">
            <a
                href={`https://twitter.com/share?url=${siteUrl}&text=TEN%20%7C%20BATTLESHIPS%20GAME`}
                target="_blank"
                className="w-6 fill-white hover:border-white hover:fill-accent"
            >
                <XIcon />
            </a>
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${siteUrl}&quote=TEN%20%7C%20BATTLESHIPS%20GAME`}
                target="_blank"
                className="w-6 fill-white hover:fill-accent"
            >
                <FacebookIcon />
            </a>
            <a
                href={`https://t.me/share/url?url=${siteUrl}&text=TEN%20%7C%20BATTLESHIPS%20GAME`}
                target="_blank"
                className="w-6 fill-white hover:fill-accent"
            >
                <TelegramIcon />
            </a>
            <a
                href={`https://api.whatsapp.com/send?text=TEN%20%7C%20BATTLESHIPS%20GAME%20${siteUrl}`}
                target="_blank"
                className="w-6 fill-white hover:fill-accent"
            >
                <WhatsappIcon />
            </a>
        </div>
    );
}
