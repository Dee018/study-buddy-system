import React from 'react';
import { useIsMobile, useIsTouchDevice } from '../utils/responsiveUtils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive container that adjusts padding for mobile
 */
export function MobileContainer({ children, className = '' }: MobileLayoutProps) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mobile-optimized grid layout
 */
interface MobileGridProps extends MobileLayoutProps {
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export function MobileGrid({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: MobileGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-5 lg:gap-6',
    lg: 'gap-6 sm:gap-8 lg:gap-10'
  };

  const gridCols = `grid-cols-${cols.mobile || 1} md:grid-cols-${cols.tablet || 2} lg:grid-cols-${cols.desktop || 3}`;

  return (
    <div className={`grid ${gridCols} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mobile-friendly card with responsive padding
 */
interface MobileCardProps extends MobileLayoutProps {
  padding?: 'sm' | 'md' | 'lg';
}

export function MobileCard({ children, className = '', padding = 'md' }: MobileCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5 lg:p-6',
    lg: 'p-5 sm:p-6 lg:p-8'
  };

  return (
    <div className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mobile-optimized text with responsive sizing
 */
interface MobileTextProps extends MobileLayoutProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  as?: keyof JSX.IntrinsicElements;
}

export function MobileText({
  children,
  className = '',
  variant = 'body',
  as
}: MobileTextProps) {
  const sizeClasses = {
    h1: 'text-2xl sm:text-3xl lg:text-4xl',
    h2: 'text-xl sm:text-2xl lg:text-3xl',
    h3: 'text-lg sm:text-xl lg:text-2xl',
    h4: 'text-base sm:text-lg lg:text-xl',
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm'
  };

  const Component = as || (variant.startsWith('h') ? (variant as any) : 'p');

  // Use React.createElement with a tolerant `any` element type to avoid strict JSX element type errors
  return React.createElement(Component as any, { className: `${sizeClasses[variant]} ${className}` }, children);
}

/**
 * Mobile-friendly scrollable area
 */
interface MobileScrollAreaProps extends MobileLayoutProps {
  maxHeight?: string;
}

export function MobileScrollArea({
  children,
  className = '',
  maxHeight = 'max-h-[60vh]'
}: MobileScrollAreaProps) {
  return (
    <div className={`overflow-y-auto ${maxHeight} -webkit-overflow-scrolling-touch ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mobile Stack - vertical layout with responsive spacing
 */
interface MobileStackProps extends MobileLayoutProps {
  spacing?: 'sm' | 'md' | 'lg';
  direction?: 'vertical' | 'horizontal';
}

export function MobileStack({
  children,
  className = '',
  spacing = 'md',
  direction = 'vertical'
}: MobileStackProps) {
  const spacingClasses = {
    sm: direction === 'vertical' ? 'space-y-2 sm:space-y-3' : 'space-x-2 sm:space-x-3',
    md: direction === 'vertical' ? 'space-y-4 sm:space-y-5 lg:space-y-6' : 'space-x-4 sm:space-x-5 lg:space-x-6',
    lg: direction === 'vertical' ? 'space-y-6 sm:space-y-8' : 'space-x-6 sm:space-x-8'
  };

  const directionClass = direction === 'vertical' ? 'flex flex-col' : 'flex flex-row';

  return (
    <div className={`${directionClass} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Touch-friendly button wrapper (ensures minimum tap target size)
 */
export function MobileTouchTarget({ children, className = '' }: MobileLayoutProps) {
  const isTouchDevice = useIsTouchDevice();

  return (
    <div className={`${isTouchDevice ? 'min-h-[44px] min-w-[44px] flex items-center justify-center' : ''} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Responsive section with mobile-optimized padding
 */
export function MobileSection({ children, className = '' }: MobileLayoutProps) {
  return (
    <section className={`py-6 sm:py-8 lg:py-10 ${className}`}>
      {children}
    </section>
  );
}

/**
 * Mobile-friendly table wrapper with horizontal scroll
 */
export function MobileTable({ children, className = '' }: MobileLayoutProps) {
  return (
    <div className={`overflow-x-auto -webkit-overflow-scrolling-touch ${className}`}>
      <div className="inline-block min-w-full align-middle">
        {children}
      </div>
    </div>
  );
}

/**
 * Adaptive layout that changes based on screen size
 */
interface AdaptiveLayoutProps extends MobileLayoutProps {
  mobileLayout: React.ReactNode;
  desktopLayout: React.ReactNode;
  breakpoint?: number;
}

export function AdaptiveLayout({
  mobileLayout,
  desktopLayout,
  breakpoint = 768,
  className = ''
}: AdaptiveLayoutProps) {
  const isMobile = useIsMobile();
  void breakpoint;

  return (
    <div className={className}>
      {isMobile ? mobileLayout : desktopLayout}
    </div>
  );
}

/**
 * Mobile-optimized form with better input spacing
 */
export function MobileForm({ children, className = '' }: MobileLayoutProps) {
  return (
    <form className={`space-y-4 sm:space-y-5 ${className}`}>
      {children}
    </form>
  );
}

/**
 * Responsive sidebar that becomes drawer on mobile
 */
interface MobileSidebarProps extends MobileLayoutProps {
  isOpen?: boolean;
  onClose?: () => void;
  position?: 'left' | 'right';
}

export function MobileSidebar({
  children,
  className = '',
  isOpen = false,
  onClose,
  position = 'left'
}: MobileSidebarProps) {
  const isMobile = useIsMobile();
  const positionClass = position === 'left' ? 'left-0' : 'right-0';

  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed top-0 ${positionClass} h-full w-[85vw] max-w-sm bg-background z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'
            } ${className}`}
        >
          {children}
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className={`${className}`}>
      {children}
    </aside>
  );
}

/**
 * Mobile-optimized modal/dialog
 */
interface MobileModalProps extends MobileLayoutProps {
  isOpen: boolean;
  onClose?: () => void;
  fullScreen?: boolean;
}

export function MobileModal({
  children,
  className = '',
  isOpen,
  onClose,
  fullScreen = false
}: MobileModalProps) {
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`fixed z-50 ${isMobile && fullScreen
        ? 'inset-0'
        : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg'
        } ${className}`}>
        <div className={`bg-background rounded-lg shadow-2xl ${isMobile && fullScreen ? 'h-full' : 'max-h-[90vh]'
          } overflow-auto`}>
          {children}
        </div>
      </div>
    </>
  );
}

/**
 * Mobile-friendly tabs that become accordion on small screens
 */
interface MobileTabsProps extends MobileLayoutProps {
  tabs: Array<{
    label: string;
    content: React.ReactNode;
  }>;
  defaultTab?: number;
}

export function MobileTabs({
  tabs,
  defaultTab = 0,
  className = ''
}: MobileTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);
  const isMobile = useIsMobile();

  if (isMobile) {
    // Accordion style for mobile
    return (
      <div className={`space-y-2 ${className}`}>
        {tabs.map((tab, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <button
              className="w-full px-4 py-3 text-left bg-muted/30 hover:bg-muted/50 transition-colors"
              onClick={() => setActiveTab(activeTab === index ? -1 : index)}
            >
              {tab.label}
            </button>
            {activeTab === index && (
              <div className="p-4">
                {tab.content}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Tab style for desktop
  return (
    <div className={className}>
      <div className="flex border-b mb-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`px-4 py-2 border-b-2 transition-colors ${activeTab === index
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}
