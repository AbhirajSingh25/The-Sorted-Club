import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to synchronize horizontal carousel pagination dots with swipe / scroll position.
 * Handles variable-width cards, touch flicking, slow dragging, CSS scroll snapping, and viewport boundaries.
 * Ensures dot clicking scrolls smoothly horizontally without unexpected vertical page jumps.
 */
export function useCarouselPagination(containerRef, itemCount) {
  const [activeDotIndex, setActiveDotIndex] = useState(0);
  const rafIdRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticTargetRef = useRef(null);

  const calculateActiveIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.children).filter(
      (child) =>
        child.nodeType === 1 &&
        !child.classList.contains('services-carousel-indicators') &&
        !child.classList.contains('estimator-carousel-indicators')
    );

    if (cards.length === 0) return;

    const scrollLeft = container.scrollLeft;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    // Hard boundary 1: At the very beginning
    if (scrollLeft <= 6) {
      setActiveDotIndex(0);
      return;
    }

    const containerRect = container.getBoundingClientRect();

    // Hard boundary 2: Scrolled to or near the end of the carousel
    const lastCard = cards[cards.length - 1];
    const lastCardRect = lastCard ? lastCard.getBoundingClientRect() : null;
    const isAtEnd =
      (maxScrollLeft > 0 && scrollLeft >= maxScrollLeft - 24) ||
      (lastCardRect && lastCardRect.right <= containerRect.right + 12);

    if (isAtEnd) {
      setActiveDotIndex(cards.length - 1);
      return;
    }

    const snapPoint = containerRect.left + 24; // Snap target alignment point (accounting for horizontal padding)

    let bestIdx = 0;
    let maxVisibleWidth = -1;
    let minSnapDistance = Infinity;

    for (let i = 0; i < cards.length; i++) {
      const cardRect = cards[i].getBoundingClientRect();
      const visibleLeft = Math.max(cardRect.left, containerRect.left);
      const visibleRight = Math.min(cardRect.right, containerRect.right);
      const visibleWidth = Math.max(0, visibleRight - visibleLeft);

      // Distance from card's left edge to the snap alignment point
      const snapDistance = Math.abs(cardRect.left - snapPoint);

      // We prioritize the card that has significant visibility and is closest to the snap point
      if (visibleWidth > maxVisibleWidth || (Math.abs(visibleWidth - maxVisibleWidth) < 20 && snapDistance < minSnapDistance)) {
        maxVisibleWidth = visibleWidth;
        minSnapDistance = snapDistance;
        bestIdx = i;
      }
    }

    setActiveDotIndex(bestIdx);
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

      // Settle fallback for momentum scroll & touch deceleration
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        calculateActiveIndex();
        isProgrammaticScrollRef.current = false;
        programmaticTargetRef.current = null;
      }, 120);
    };

    const handleScrollEnd = () => {
      calculateActiveIndex();
      isProgrammaticScrollRef.current = false;
      programmaticTargetRef.current = null;
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
      (child) =>
        child.nodeType === 1 &&
        !child.classList.contains('services-carousel-indicators') &&
        !child.classList.contains('estimator-carousel-indicators')
    );

    if (!cards[index]) return;

    isProgrammaticScrollRef.current = true;
    programmaticTargetRef.current = index;
    setActiveDotIndex(index);

    if (index === 0) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    if (index === cards.length - 1) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      return;
    }

    const targetCard = cards[index];
    const firstCard = cards[0];

    // Calculate horizontal scroll offset without causing any vertical window jump
    const targetScrollLeft = targetCard.offsetLeft - (firstCard ? firstCard.offsetLeft : 0);

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
  }, [containerRef]);

  return {
    activeDotIndex,
    focusedIndex: activeDotIndex,
    setActiveDotIndex,
    scrollToIndex
  };
}
