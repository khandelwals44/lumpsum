"use client";

import { useEffect, useRef } from 'react';

interface ClickBlockerInfo {
  selector: string;
  styles: {
    position: string;
    zIndex: string;
    pointerEvents: string;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  boundingBox: DOMRect;
}

export function ClickBlockersDebug() {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Find header element
    headerRef.current = document.querySelector('header');
    if (!headerRef.current) {
      console.warn('🔍 ClickBlockersDebug: Header not found');
      return;
    }

    const header = headerRef.current;
    const headerRect = header.getBoundingClientRect();

    console.log('🔍 ClickBlockersDebug: Header found at', {
      top: headerRect.top,
      left: headerRect.left,
      width: headerRect.width,
      height: headerRect.height,
      zIndex: window.getComputedStyle(header).zIndex
    });

    // Find overlapping elements
    const allElements = document.querySelectorAll('*');
    const blockers: ClickBlockerInfo[] = [];

    allElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      
      // Check if element overlaps with header
      const overlaps = !(
        rect.bottom < headerRect.top ||
        rect.top > headerRect.bottom ||
        rect.right < headerRect.left ||
        rect.left > headerRect.right
      );

      if (overlaps) {
        const position = styles.position;
        const zIndex = parseInt(styles.zIndex) || 0;
        const pointerEvents = styles.pointerEvents;

        // Check if element could block clicks
        if (
          (position === 'fixed' || position === 'absolute') &&
          zIndex >= 50 && // Header has z-50
          pointerEvents !== 'none'
        ) {
          blockers.push({
            selector: generateSelector(element),
            styles: {
              position,
              zIndex: styles.zIndex,
              pointerEvents,
              top: styles.top,
              left: styles.left,
              right: styles.right,
              bottom: styles.bottom
            },
            boundingBox: rect
          });
        }
      }
    });

    if (blockers.length > 0) {
      console.warn('🚨 ClickBlockersDebug: Potential click blockers detected:', blockers);
    } else {
      console.log('✅ ClickBlockersDebug: No click blockers detected');
    }

    // Global click listener to detect prevented clicks
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isLink = target.closest('a[href]') || target.closest('[role="link"]');
      
      if (isLink && event.defaultPrevented) {
        console.warn('🚨 ClickBlockersDebug: Click prevented on link:', {
          element: generateSelector(target),
          href: (target.closest('a[href]') as HTMLAnchorElement)?.href,
          defaultPrevented: event.defaultPrevented
        });
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return null;
}

function generateSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.className) {
    const classes = element.className.split(' ').filter(Boolean);
    if (classes.length > 0) {
      return `.${classes[0]}`;
    }
  }
  
  return element.tagName.toLowerCase();
}
