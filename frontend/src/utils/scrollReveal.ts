/**
 * Global Scroll Reveal & Cascade Animation Engine
 * Automatically orchestrates smooth scroll-triggered entrances for cards,
 * sections, and content elements across the entire website.
 */

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  staggerDelay?: number;
  autoDetectCards?: boolean;
}

const DEFAULT_OPTIONS: ScrollRevealOptions = {
  threshold: 0.05,
  rootMargin: '0px 0px -30px 0px',
  staggerDelay: 75,
  autoDetectCards: true,
};

let globalObserver: IntersectionObserver | null = null;
let mutationObserver: MutationObserver | null = null;
let scrollListener: (() => void) | null = null;

/**
 * Checks if an element is already above or within the initial viewport
 */
function isInInitialViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return false;
  }
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < windowHeight * 0.9 && rect.bottom > 0;
}

/**
 * Checks if an element should be excluded from scroll reveal
 */
function isExcluded(el: Element): boolean {
  return !!el.closest('header, nav, aside, [role="dialog"], [role="menu"], .no-reveal');
}

/**
 * Checks all unrevealed elements against current scroll viewport (scroll fallback)
 */
function checkVisibleElements() {
  const unrevealed = document.querySelectorAll<HTMLElement>(
    '.reveal-on-scroll:not(.is-revealed), .reveal-scale:not(.is-revealed), .reveal-from-left:not(.is-revealed), .reveal-from-right:not(.is-revealed), .reveal-fade:not(.is-revealed)'
  );

  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  unrevealed.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= windowHeight - 40 && rect.bottom >= 0) {
      el.classList.add('is-revealed');
      if (globalObserver) {
        globalObserver.unobserve(el);
      }
    }
  });
}

/**
 * Attaches scroll reveal animation to a specific element
 */
export function registerRevealElement(
  el: HTMLElement,
  observer: IntersectionObserver,
  delayMs?: number
) {
  if (isExcluded(el)) return;

  // If element is already revealed, nothing more to do
  if (el.classList.contains('is-revealed')) return;

  // Ensure base reveal class is applied
  if (
    !el.classList.contains('reveal-on-scroll') &&
    !el.classList.contains('reveal-scale') &&
    !el.classList.contains('reveal-from-left') &&
    !el.classList.contains('reveal-from-right') &&
    !el.classList.contains('reveal-fade')
  ) {
    el.classList.add('reveal-on-scroll');
  }

  // Set stagger delay if specified
  if (delayMs !== undefined && delayMs > 0) {
    el.style.setProperty('--reveal-delay', `${delayMs}ms`);
  }

  // If already visible on screen when registered, reveal immediately
  if (isInInitialViewport(el)) {
    requestAnimationFrame(() => {
      el.classList.add('is-revealed');
    });
    return;
  }

  // Observe for scroll entrance
  observer.observe(el);
}

/**
 * Queries DOM for elements that should animate on scroll
 */
export function scanAndObserveElements(
  root: Document | HTMLElement = document,
  options: ScrollRevealOptions = DEFAULT_OPTIONS
) {
  if (!globalObserver) {
    globalObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.classList.add('is-revealed');
          obs.unobserve(target);
        }
      });
    }, {
      threshold: options.threshold,
      rootMargin: options.rootMargin,
    });
  }

  // 1. Explicitly tagged elements
  const explicitElements = root.querySelectorAll<HTMLElement>(
    '.reveal-on-scroll:not(.is-revealed), .reveal-scale:not(.is-revealed), .reveal-from-left:not(.is-revealed), .reveal-from-right:not(.is-revealed), .reveal-fade:not(.is-revealed), [data-reveal]:not(.is-revealed)'
  );
  explicitElements.forEach((el) => {
    if (isExcluded(el)) return;
    const customDelay = el.getAttribute('data-reveal-delay');
    const delay = customDelay ? parseInt(customDelay, 10) : undefined;
    registerRevealElement(el, globalObserver!, delay);
  });

  // 2. Auto-detected cards, grid items, and sections (if enabled)
  if (options.autoDetectCards) {
    // A. Major section headers & banners
    const sectionHeaders = root.querySelectorAll<HTMLElement>(
      'section > div:first-child:not(.is-revealed), .section-header:not(.is-revealed)'
    );
    sectionHeaders.forEach((sh) => {
      if (isExcluded(sh)) return;
      registerRevealElement(sh, globalObserver!);
    });

    // B. Grid card collections (vehicle cards, category cards, location cards, feature cards)
    const grids = root.querySelectorAll<HTMLElement>(
      '.grid:not(.no-reveal), [class*="grid-cols-"]:not(.no-reveal)'
    );

    grids.forEach((grid) => {
      if (isExcluded(grid)) return;
      const children = Array.from(grid.children) as HTMLElement[];
      if (children.length >= 2) {
        children.forEach((child, idx) => {
          if (child.classList.contains('is-revealed') || isExcluded(child)) return;
          const colIndex = idx % 4;
          const stagger = colIndex * (options.staggerDelay || 75);
          registerRevealElement(child, globalObserver!, stagger);
        });
      }
    });

    // C. Standalone articles, dashboard cards, and feature cards
    const standaloneCards = root.querySelectorAll<HTMLElement>(
      'article:not(.is-revealed), .card-reveal:not(.is-revealed), [data-card]:not(.is-revealed)'
    );
    standaloneCards.forEach((card, idx) => {
      if (isExcluded(card)) return;
      registerRevealElement(card, globalObserver!, (idx % 3) * 60);
    });
  }

  // Perform quick pass for any elements already scrolled into view
  checkVisibleElements();
}

/**
 * Initializes the global scroll reveal engine.
 * Sets up intersection observer, scroll listener, and mutation observer for dynamic pages.
 */
export function initScrollReveal(options: ScrollRevealOptions = DEFAULT_OPTIONS): () => void {
  // Respect user preference for reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .reveal-from-left, .reveal-from-right, .reveal-fade')
      .forEach((el) => el.classList.add('is-revealed'));
    return () => {};
  }

  // Initial scan
  scanAndObserveElements(document, options);

  // Scroll listener with requestAnimationFrame for 60fps butter-smooth responsiveness
  let ticking = false;
  scrollListener = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        checkVisibleElements();
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', scrollListener, { passive: true });
  window.addEventListener('resize', scrollListener, { passive: true });

  // Set up MutationObserver to detect dynamically mounted elements (e.g. filtered cards)
  let scanTimeout: number | null = null;
  mutationObserver = new MutationObserver(() => {
    if (scanTimeout) clearTimeout(scanTimeout);
    scanTimeout = window.setTimeout(() => {
      scanAndObserveElements(document, options);
    }, 50);
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => {
    if (scanTimeout) clearTimeout(scanTimeout);
    if (scrollListener) {
      window.removeEventListener('scroll', scrollListener);
      window.removeEventListener('resize', scrollListener);
      scrollListener = null;
    }
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
    if (globalObserver) {
      globalObserver.disconnect();
      globalObserver = null;
    }
  };
}
