'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface LogoProps {
  size?: number;
  className?: string;
  classNameImage?: string;
  showText?: boolean;
  textVariant?: 'landing' | 'dashboard' | 'compact';
  subtitle?: string;
  href?: string;
  priority?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 32,
  className = '',
  classNameImage = '',
  showText = false,
  textVariant = 'landing',
  subtitle,
  href,
  priority = false,
}) => {
  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="Saarthi AI Logo"
          width={size}
          height={size}
          priority={priority}
          className={`w-full h-full object-contain drop-shadow-md ${classNameImage}`}
        />
      </div>

      {showText && textVariant === 'landing' && (
        <div className="flex flex-col">
          <span className="font-display font-bold text-sm tracking-tight text-zinc-900 dark:text-white leading-none">
            Saarthi AI
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono leading-tight mt-1">
            {subtitle ?? 'Business Automation'}
          </span>
        </div>
      )}

      {showText && textVariant === 'dashboard' && (
        <div>
          <h1 className="font-display font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 leading-none">
            SAARTHI{' '}
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-sans font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
              AI
            </span>
          </h1>
          {subtitle && (
            <p className="text-[11px] text-zinc-400 font-sans font-medium truncate max-w-[130px] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {showText && textVariant === 'compact' && (
        <div>
          <span className="font-display font-bold text-sm text-zinc-900 dark:text-white">
            Saarthi AI
          </span>
          {subtitle && (
            <span className="text-xs font-devanagari text-zinc-500 dark:text-zinc-400 block">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center" aria-label="Saarthi AI">
        {content}
      </Link>
    );
  }

  return content;
};
