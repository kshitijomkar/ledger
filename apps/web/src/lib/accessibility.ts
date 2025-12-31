/**
 * Accessibility utility functions
 */

/**
 * Generate an accessible label for form validation errors
 */
export function getErrorLabel(fieldName: string, error?: string): string {
  return error ? `${fieldName}: ${error}` : '';
}

/**
 * Generate aria-label for action buttons
 */
export function getActionLabel(action: string, itemName?: string): string {
  return itemName ? `${action} ${itemName}` : action;
}

/**
 * Create keyboard navigation handler
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void
) {
  if (event.key === 'Enter') {
    onEnter?.();
  } else if (event.key === 'Escape') {
    onEscape?.();
  }
}

/**
 * Announce text to screen readers
 */
export function announceToScreenReader(text: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = text;
  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 3000);
}

/**
 * Focus management utility
 */
export function setFocusAfterAction(selector: string) {
  setTimeout(() => {
    const element = document.querySelector(selector) as HTMLElement;
    element?.focus();
  }, 100);
}
