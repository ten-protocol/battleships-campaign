import logoHead from '@/assets/logo-head.png';

type Props = {
    ensImage?: string;
    size: number;
};

export default function Avatar({ ensImage, size }: Props) {
    return ensImage ? (
        <img src={ensImage} width={size} height={size} style={{ borderRadius: 999 }} />
    ) : (
        <img src={logoHead} width={size / 1.5} height={size / 1.5} style={{ borderRadius: 999 }} />
    );
}
