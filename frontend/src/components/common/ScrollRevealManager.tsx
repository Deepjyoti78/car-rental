import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initScrollReveal, scanAndObserveElements } from '../../utils/scrollReveal';

export const ScrollRevealManager: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Initialize global engine on mount
    const cleanup = initScrollReveal({
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px',
      staggerDelay: 75,
      autoDetectCards: true,
    });

    return () => {
      cleanup();
    };
  }, []);

  // On route or query parameter change, trigger an immediate scan after render
  useEffect(() => {
    const timer = setTimeout(() => {
      scanAndObserveElements(document);
    }, 40);

    return () => clearTimeout(timer);
  }, [pathname, search]);

  return null;
};
