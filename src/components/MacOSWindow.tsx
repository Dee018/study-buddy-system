import React, { ReactNode } from 'react';

interface MacOSWindowProps {
  children: ReactNode;
  title?: string;
  showTrafficLights?: boolean;
  className?: string;
}

export function MacOSWindow({
  children,
  title,
  showTrafficLights = true,
  className = ''
}: MacOSWindowProps) {
  return (
    <div className={`macos-card macos-shadow-lg overflow-hidden ${className}`}>
      {/* Window Chrome / Title Bar */}
      {showTrafficLights && (
        <div className="glass-effect-strong border-b border-border/50 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Traffic Light Buttons */}
            <div className="flex items-center space-x-2">
              <button
                className="traffic-light traffic-light-red cursor-not-allowed opacity-50"
                aria-label="Close"
                disabled
              />
              <button
                className="traffic-light traffic-light-yellow cursor-not-allowed opacity-50"
                aria-label="Minimize"
                disabled
              />
              <button
                className="traffic-light traffic-light-green cursor-not-allowed opacity-50"
                aria-label="Maximize"
                disabled
              />
            </div>
          </div>

          {/* Window Title */}
          {title && (
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
            </div>
          )}
        </div>
      )}

      {/* Window Content */}
      <div className="bg-card">
        {children}
      </div>
    </div>
  );
}

interface MacOSPanelProps {
  children: ReactNode;
  className?: string;
  withShadow?: boolean;
}

export function MacOSPanel({ children, className = '', withShadow = true }: MacOSPanelProps) {
  return (
    <div className={`
      glass-effect rounded-lg border border-border/50 
      ${withShadow ? 'macos-shadow' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

interface MacOSCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function MacOSCard({
  children,
  className = '',
  hoverable = false,
  onClick
}: MacOSCardProps) {
  return (
    <div
      className={`
        macos-card p-4
        ${hoverable ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
        smooth-transition
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
