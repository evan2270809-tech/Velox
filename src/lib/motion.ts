// Antimetal-style spring easing as a numeric keyframe array.
// framer-motion accepts this as a custom ease function, and it avoids the
// CSS linear() compatibility gap on older Safari.
export const SPRING_EASE: number[] = [
  0, 0.026, 0.103, 0.231, 0.412, 0.642, 0.829, 0.979, 1.09, 1.165, 1.205,
  1.215, 1.197, 1.157, 1.099, 1.029, 0.998, 0.974, 0.957, 0.948, 0.946,
  0.951, 0.961, 0.997, 1.018, 1.024, 1.001, 1,
];
export const SPRING_DURATION = 0.7;

// Initial state for fade-up entrances (paired with `whileInView` or `animate`).
export const INITIAL_HIDDEN = { opacity: 0, y: 16 };
export const INITIAL_HIDDEN_LARGE = { opacity: 0, y: 18 };

export const SHOW = { opacity: 1, y: 0 };

// Build a transition with optional stagger delay.
export const springTransition = (delay = 0) => ({
  duration: SPRING_DURATION,
  ease: SPRING_EASE,
  delay,
});

// Once-only viewport for scroll-triggered reveals.
export const ONCE_VIEWPORT = { once: true, amount: 0.2 } as const;
