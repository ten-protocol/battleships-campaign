import { ReactNode } from 'react';

import styles from './styles.module.scss';

type Props = {
    onClick?: () => void;
    variant?: 'light' | 'dark' | 'hoverBorder';
    children?: ReactNode;
    classes?: string | string[];
};

export default function Button({ onClick, variant = 'dark', children, classes = '' }: Props) {
    return (
        <button
            className={[styles.button, styles[variant], ...classes].join(
                ' '
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
