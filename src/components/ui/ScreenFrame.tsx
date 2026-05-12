import React from 'react';
import { ParticleBackground } from './ParticleBackground';

interface ScreenFrameProps {
  children: React.ReactNode;
  reduceMotion?: boolean;
  showParticles?: boolean;
  fullScreen?: boolean;
  className?: string;
  contentClassName?: string;
}

export function ScreenFrame({
  children,
  reduceMotion = false,
  showParticles = true,
  fullScreen = true,
  className = '',
  contentClassName = ''
}: ScreenFrameProps) {
  const sizing = fullScreen ? 'w-full min-h-dvh h-dvh' : 'w-full';
  return (
    <div
      className={`relative ${sizing} flex flex-col overflow-hidden bg-dark-darker bg-grid-pattern ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-dark-darker via-transparent to-dark-darker/90"
      />
      {showParticles ? <ParticleBackground reduceMotion={reduceMotion} /> : null}
      <div className={`relative z-10 flex flex-1 flex-col ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}

