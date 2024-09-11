import { AvatarComponent } from '@rainbow-me/rainbowkit';

import logoHead from '@/assets/logo-head.png';

const Avatar: AvatarComponent = ({ address, ensImage, size }) => {
    return ensImage ? (
        <img src={ensImage} width={size} height={size} style={{ borderRadius: 999 }} />
    ) : (
        <img src={logoHead} width={size / 1.5} height={size / 1.5} style={{ borderRadius: 999 }} />
    );
};

export default Avatar;
