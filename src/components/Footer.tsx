import React from 'react';

interface FooterProps {
  onNavigate?: (screen: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const handleNavigation = (screen: string) => {
    if (onNavigate) {
      onNavigate(screen);
    }
  };

  return (
    <>
      {/* Subtle divider line */}
      <div className="mt-16">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Footer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 text-center sm:text-left">
              {/* Product Column */}
              <div>
                <h4 className="mb-4">Product</h4>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => handleNavigation('about')}
                      className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation('help')}
                      className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      Help Center
                    </button>
                  </li>
                </ul>
              </div>

              {/* Resources Column */}
              <div>
                <h4 className="mb-4">Resources</h4>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => handleNavigation('progress')}
                      className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      Progress Tracker
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation('chat')}
                      className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      AI Tutor
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation('report')}
                      className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      Report Issue
                    </button>
                  </li>
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h4 className="mb-4">Legal</h4>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => handleNavigation('privacy')}
                      className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation('terms')}
                      className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      Terms of Use
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation('contact')}
                      className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      Contact Us
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-10 pt-8 border-t border-border/50 text-center">
              <p className="text-muted-foreground">
                © 2025 Study Buddy. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
