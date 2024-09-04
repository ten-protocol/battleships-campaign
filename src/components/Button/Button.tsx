import { ReactNode } from 'react';

import styles from './styles.module.scss';

type Props = {
    onClick?: () => void;
    variant?: 'light' | 'dark' | 'hoverBorder' | 'hoverBorderRed';
    children?: ReactNode;
    className?: string;
};

export default function Button({ onClick, variant = 'dark', children, className = '' }: Props) {
    return (
        <button className={[styles.button, styles[variant], className].join(' ')} onClick={onClick}>
            {children}
        </button>
    );
}
