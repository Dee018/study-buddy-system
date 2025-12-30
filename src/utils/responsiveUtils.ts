/**
 * Responsive Utilities
 * Helper functions for mobile-responsive behavior
 */

import { useState, useEffect } from 'react';

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

const defaultBreakpoints: BreakpointConfig = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280
};

/**
 * Hook to detect current breakpoint
 */
export function useBreakpoint(breakpoints: BreakpointConfig = defaultBreakpoints) {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop' | 'wide'>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < breakpoints.mobile) {
        setBreakpoint('mobile');
      } else if (width < breakpoints.tablet) {
        setBreakpoint('mobile');
      } else if (width < breakpoints.desktop) {
        setBreakpoint('tablet');
      } else if (width < breakpoints.wide) {
        setBreakpoint('desktop');
      } else {
        setBreakpoint('wide');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [breakpoints]);

  return breakpoint;
}

/**
 * Hook to check if mobile device
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Hook to check if tablet device
 */
export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };

    checkTablet();
    window.addEventListener('resize', checkTablet);

    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  return isTablet;
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }, []);

  return isTouchDevice;
}

/**
 * Hook for window dimensions
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook for viewport dimensions (accounting for mobile browsers)
 */
export function useViewportSize() {
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.visualViewport?.height || window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  return viewportSize;
}

/**
 * Get responsive class names based on breakpoint
 */
export function getResponsiveClasses(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  const classes = [mobile];
  
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  
  return classes.join(' ');
}

/**
 * Check if device is in portrait mode
 */
export function useIsPortrait(): boolean {
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return isPortrait;
}

/**
 * Hook for safe area insets (for notched devices)
 */
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    
    setInsets({
      top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--sar') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--sal') || '0')
    });
  }, []);

  return insets;
}

/**
 * Debounced window resize handler
 */
export function useDebouncedResize(callback: () => void, delay: number = 250) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [callback, delay]);
}

/**
 * Get optimal font size for current viewport
 */
export function getResponsiveFontSize(
  baseSizePx: number,
  minSizePx: number = 12,
  maxSizePx: number = 24
): number {
  if (typeof window === 'undefined') return baseSizePx;

  const width = window.innerWidth;
  const scaleFactor = width / 1024; // Base scale on desktop width
  const scaledSize = baseSizePx * scaleFactor;

  return Math.max(minSizePx, Math.min(maxSizePx, scaledSize));
}

/**
 * Check if device supports hover
 */
export function useSupportsHover(): boolean {
  const [supportsHover, setSupportsHover] = useState(true);

  useEffect(() => {
    setSupportsHover(window.matchMedia('(hover: hover)').matches);
  }, []);

  return supportsHover;
}

/**
 * Get responsive grid columns
 */
export function getResponsiveGridColumns(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3,
  wide: number = 4
): string {
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop} xl:grid-cols-${wide}`;
}

/**
 * Responsive container padding
 */
export function getResponsivePadding(
  mobilePx: number = 16,
  tabletPx: number = 24,
  desktopPx: number = 32
): string {
  return `px-[${mobilePx}px] md:px-[${tabletPx}px] lg:px-[${desktopPx}px]`;
}

/**
 * Get mobile-optimized grid classes
 */
export function getMobileGridClasses(cols: number): string {
  const classes = ['grid', 'gap-4'];
  
  if (cols === 1) {
    classes.push('grid-cols-1');
  } else if (cols === 2) {
    classes.push('grid-cols-1', 'sm:grid-cols-2');
  } else if (cols === 3) {
    classes.push('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  } else if (cols === 4) {
    classes.push('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
  }
  
  return classes.join(' ');
}

/**
 * Get mobile-friendly card padding
 */
export function getMobileCardPadding(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5 lg:p-6',
    lg: 'p-5 sm:p-6 lg:p-8'
  };
  return sizes[size];
}

/**
 * Get mobile-optimized text size classes
 */
export function getMobileTextClasses(variant: 'heading' | 'body' | 'caption' = 'body'): string {
  const variants = {
    heading: 'text-lg sm:text-xl lg:text-2xl',
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm'
  };
  return variants[variant];
}

/**
 * Get mobile-friendly button size
 */
export function getMobileButtonSize(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: 'min-h-[40px] px-3 text-sm',
    md: 'min-h-[44px] px-4',
    lg: 'min-h-[48px] px-6'
  };
  return sizes[size];
}

/**
 * Check if device is iOS
 */
export function useIsIOS(): boolean {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  return isIOS;
}

/**
 * Check if device is Android
 */
export function useIsAndroid(): boolean {
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(userAgent));
  }, []);

  return isAndroid;
}

/**
 * Check if reduced motion is preferred
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
