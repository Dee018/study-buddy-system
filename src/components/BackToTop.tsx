import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-muted/80 hover:bg-muted border border-border shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm flex items-center justify-center opacity-60 hover:opacity-100"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5 text-foreground" />
        </button>
      )}
    </>
  );
}