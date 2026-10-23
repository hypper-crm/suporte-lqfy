// A mouse drag starts after a short movement, so a click still opens the item.
export const mouseActivationConstraint = { distance: 5 }

// A touch drag starts after a short press, so a swipe still scrolls the page.
export const touchActivationConstraint = { delay: 150, tolerance: 5 }
