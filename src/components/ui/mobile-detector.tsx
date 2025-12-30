/**
 * Mobile Detector Component and Utilities
 * Provides convenient components for conditional mobile rendering
 */

import React from 'react';
import { useIsMobile, useIsTablet, useIsTouchDevice } from '../../utils/responsiveUtils';

interface ConditionalRenderProps {
  children: React.ReactNode;
}

/**
 * Renders children only on mobile devices
 */
export function MobileOnly({ children }: ConditionalRenderProps) {
  const isMobile = useIsMobile();
  return isMobile ? <>{children}</> : null;
}

/**
 * Renders children only on tablet devices
 */
export function TabletOnly({ children }: ConditionalRenderProps) {
  const isTablet = useIsTablet();
  return isTablet ? <>{children}</> : null;
}

/**
 * Renders children only on desktop devices
 */
export function DesktopOnly({ children }: ConditionalRenderProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  return !isMobile && !isTablet ? <>{children}</> : null;
}

/**
 * Renders children only on touch devices
 */
export function TouchOnly({ children }: ConditionalRenderProps) {
  const isTouchDevice = useIsTouchDevice();
  return isTouchDevice ? <>{children}</> : null;
}

/**
 * Renders children only on non-touch devices
 */
export function NonTouchOnly({ children }: ConditionalRenderProps) {
  const isTouchDevice = useIsTouchDevice();
  return !isTouchDevice ? <>{children}</> : null;
}

/**
 * Renders different content based on device type
 */
interface ResponsiveRenderProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ResponsiveRender({
  mobile,
  tablet,
  desktop,
  fallback
}: ResponsiveRenderProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile && mobile) {
    return <>{mobile}</>;
  }

  if (isTablet && tablet) {
    return <>{tablet}</>;
  }

  if (!isMobile && !isTablet && desktop) {
    return <>{desktop}</>;
  }

  return fallback ? <>{fallback}</> : null;
}

/**
 * Higher-order component that provides device info to wrapped component
 */
interface WithDeviceInfoProps {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
}

export function withDeviceInfo<P extends object>(
  Component: React.ComponentType<P & WithDeviceInfoProps>
) {
  return function WithDeviceInfoWrapper(props: P) {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const isTouchDevice = useIsTouchDevice();
    const isDesktop = !isMobile && !isTablet;

    return (
      <Component
        {...props}
        isMobile={isMobile}
        isTablet={isTablet}
        isDesktop={isDesktop}
        isTouchDevice={isTouchDevice}
      />
    );
  };
}

/**
 * Context for device information
 */
interface DeviceContextValue {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
}

const DeviceContext = React.createContext<DeviceContextValue | undefined>(undefined);

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isTouchDevice = useIsTouchDevice();
  const isDesktop = !isMobile && !isTablet;

  return (
    <DeviceContext.Provider value={{ isMobile, isTablet, isDesktop, isTouchDevice }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = React.useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}

/**
 * Mobile-aware className utility
 */
interface MobileClassNameProps {
  base?: string;
  mobile?: string;
  tablet?: string;
  desktop?: string;
  className?: string;
}

export function useMobileClassName({
  base = '',
  mobile = '',
  tablet = '',
  desktop = '',
  className = ''
}: MobileClassNameProps): string {
  const isMobileDevice = useIsMobile();
  const isTabletDevice = useIsTablet();

  let classes = base;

  if (isMobileDevice && mobile) {
    classes += ` ${mobile}`;
  } else if (isTabletDevice && tablet) {
    classes += ` ${tablet}`;
  } else if (desktop) {
    classes += ` ${desktop}`;
  }

  if (className) {
    classes += ` ${className}`;
  }

  return classes.trim();
}

/**
 * Component that applies mobile-specific classes
 */
interface MobileAwareProps extends MobileClassNameProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export function MobileAware({
  children,
  as: Component = 'div',
  base,
  mobile,
  tablet,
  desktop,
  className
}: MobileAwareProps) {
  const classes = useMobileClassName({ base, mobile, tablet, desktop, className });

  // Render using createElement with tolerant any cast to avoid strict JSX element-type errors
  return React.createElement(Component as any, { className: classes }, children);
}

/**
 * Show/Hide based on breakpoint
 */
interface BreakpointProps {
  children: React.ReactNode;
  show?: ('mobile' | 'tablet' | 'desktop')[];
  hide?: ('mobile' | 'tablet' | 'desktop')[];
}

export function Breakpoint({ children, show, hide }: BreakpointProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();


  const currentDevice = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  if (show && !show.includes(currentDevice)) {
    return null;
  }

  if (hide && hide.includes(currentDevice)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Portal for mobile-specific overlays
 */
export function MobileOverlay({
  children,
  isOpen,
  onClose
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Mobile content */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-h-[90vh] overflow-auto bg-background rounded-lg shadow-2xl">
        {children}
      </div>
    </>
  );
}
