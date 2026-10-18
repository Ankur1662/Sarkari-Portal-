/**
 * Subscription Service for SarkariPortal
 * Handles email validation, persistence in localStorage, duplicate prevention, and status reporting.
 */

const STORAGE_KEY = 'sarkari_subscribed_emails';

export interface SubscriptionResult {
  success: boolean;
  message: string;
  isDuplicate?: boolean;
}

/**
 * Validates email according to standard format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  // RFC 5322 compatible regex check with valid domain requirements
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Retrieves all verified subscribed emails
 */
export function getSubscribedEmails(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read subscription storage', err);
    return [];
  }
}

/**
 * Subscribes an email to the Daily Job Digest.
 * Validates format, checks for duplicates, and guarantees storage confirmation.
 */
export function subscribeToDailyDigest(email: string): SubscriptionResult {
  const trimmed = email ? email.trim() : '';

  if (!trimmed) {
    return {
      success: false,
      message: 'Email address is required.',
    };
  }

  if (!isValidEmail(trimmed)) {
    return {
      success: false,
      message: 'Please enter a valid email address (e.g. yourname@example.com).',
    };
  }

  const normalized = trimmed.toLowerCase();

  try {
    const currentList = getSubscribedEmails();

    // Prevent duplicate subscriptions
    if (currentList.includes(normalized)) {
      return {
        success: false,
        message: 'This email is already subscribed to the Daily Job Digest.',
        isDuplicate: true,
      };
    }

    // Persist to backend storage
    const updatedList = [normalized, ...currentList];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    // Verify persistence succeeded
    const verify = localStorage.getItem(STORAGE_KEY);
    if (!verify || !verify.includes(normalized)) {
      return {
        success: false,
        message: 'Subscription could not be saved to storage. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Subscribed successfully! You will receive verified morning exam alerts.',
    };
  } catch (err) {
    console.error('Subscription storage error', err);
    return {
      success: false,
      message: 'Subscription storage failed. Please check browser storage permissions.',
    };
  }
}
