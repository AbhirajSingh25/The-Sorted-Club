import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to synchronize horizontal carousel pagination dots with swipe / scroll position.
 * Handles variable-width cards, touch flicking, slow dragging, and scroll snapping.
 * Ensures dot clicking scrolls smoothly horizontally without unexpected vertical page jumps.
 */
export function useCarouselPagination(containerRef, itemCount) {
  const [activeDotIndex, setActiveDotIndex] = useState(0);
  const isUserScrollingRef = useRef(false);
  const rafIdRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const calculateActiveIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.children).filter(
      (child) => child.nodeType === 1 && !child.classList.contains('services-carousel-indicators') && !child.classList.contains('estimator-carousel-indicators')
    );

    if (cards.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < cards.length; i++) {
      const cardRect = cards[i].getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = i;
      }
    }

    setActiveDotIndex(closestIdx);
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Recalculate initially
    calculateActiveIndex();

    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        calculateActiveIndex();
      });

      // Settle fallback for browsers lacking scrollend
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        calculateActiveIndex();
      }, 100);
    };

    const handleScrollEnd = () => {
      calculateActiveIndex();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('scrollend', handleScrollEnd, { passive: true });
    window.addEventListener('resize', calculateActiveIndex);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('scrollend', handleScrollEnd);
      window.removeEventListener('resize', calculateActiveIndex);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [containerRef, itemCount, calculateActiveIndex]);

  const scrollToIndex = useCallback((index) => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.children).filter(
      (child) => child.nodeType === 1 && !child.classList.contains('services-carousel-indicators') && !child.classList.contains('estimator-carousel-indicators')
    );

    if (!cards[index]) return;

    const targetCard = cards[index];
    const firstCard = cards[0];

    // Calculate horizontal scroll offset without causing any vertical window jump
    const targetScrollLeft = targetCard.offsetLeft - (firstCard ? firstCard.offsetLeft : 0);

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });

    setActiveDotIndex(index);
  }, [containerRef]);

  return {
    activeDotIndex,
    setActiveDotIndex,
    scrollToIndex
  };
}
