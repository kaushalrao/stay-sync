import React from 'react';
import Link from 'next/link';
import { FeatureCardProps } from '@lib/types';
import { FEATURE_CARD_STYLES } from '@lib/constants';

export const FeatureCard: React.FC<FeatureCardProps> = ({
    href,
    title,
    description,
    label,
    icon: Icon,
    color,
    iconRotation = 'rotate-0',
    iconHoverRotation = 'group-hover:rotate-0'
}) => {
    const styles = FEATURE_CARD_STYLES[color];

    return (
        <Link
            href={href}
            className={`group relative h-36 md:h-72 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-xl hover:shadow-2xl ${styles.shadow} ${styles.bg} block ring-1 ring-white/10`}
        >
            <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/10 transition-colors duration-500"></div>

            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
                <div className={`${styles.labelBg} w-fit px-2 py-0.5 md:px-3 md:py-1 rounded-full backdrop-blur-md mb-2 md:mb-4 border border-white/5`}>
                    <span className={`${styles.labelText} text-[10px] md:text-xs font-bold tracking-wider uppercase`}>{label}</span>
                </div>
                <h2 className="text-xl md:text-4xl font-black text-white mb-1 md:mb-3 tracking-tighter leading-tight">{title}</h2>
                <p className={`${styles.descText} text-xs md:text-base font-medium max-w-[200px] leading-relaxed hidden sm:block`}>{description}</p>
            </div>

            <div className={`absolute -bottom-2 -right-2 md:-bottom-8 md:-right-8 transition-transform duration-500 group-hover:scale-110 ${iconRotation} ${iconHoverRotation}`}>
                <Icon className={`w-24 h-24 md:w-[180px] md:h-[180px] ${styles.icon} mix-blend-screen drop-shadow-2xl opacity-90`} strokeWidth={1.5} />
            </div>
        </Link>
    );
};
