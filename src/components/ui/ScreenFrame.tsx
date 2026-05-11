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
  const sizing = fullScreen ? 'w-full h-screen' : 'w-full';
  return (
    <div
      className={`relative ${sizing} bg-dark-darker overflow-hidden flex flex-col bg-grid-pattern ${className}`}>
      {showParticles ? <ParticleBackground reduceMotion={reduceMotion} /> : null}
      <div className={`relative z-10 flex flex-col flex-1 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}

