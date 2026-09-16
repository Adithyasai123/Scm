import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names with clsx support.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format date values safely into standard human-readable display.
 * Uses native Intl.DateTimeFormat with fallback.
 */
export function formatDate(
  date: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions | string
): string {
  if (!date) return '-';

  try {
    const parsedDate = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) return '-';

    if (typeof options === 'string') {
      // Basic formatting token support if format string passed (e.g. 'yyyy-MM-dd')
      const pad = (n: number) => n.toString().padStart(2, '0');
      const year = parsedDate.getFullYear();
      const month = pad(parsedDate.getMonth() + 1);
      const day = pad(parsedDate.getDate());
      const hours = pad(parsedDate.getHours());
      const minutes = pad(parsedDate.getMinutes());
      const seconds = pad(parsedDate.getSeconds());

      return options
        .replace(/yyyy/g, String(year))
        .replace(/MM/g, month)
        .replace(/dd/g, day)
        .replace(/HH/g, hours)
        .replace(/mm/g, minutes)
        .replace(/ss/g, seconds);
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options,
    };

    return new Intl.DateTimeFormat('en-IN', defaultOptions).format(parsedDate);
  } catch {
    return '-';
  }
}

/**
 * Formats a monetary amount into a localized currency string.
 * Defaults to INR (₹) as per standard SCM telecom domain requirements.
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency = 'INR',
  locale = 'en-IN'
): string {
  if (amount === null || amount === undefined || amount === '') return '₹0.00';

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '₹0.00';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `₹${numericAmount.toFixed(2)}`;
  }
}

/**
 * Debounce a function call by the specified delay in milliseconds.
 * Preserves parameter types and context without using 'any'.
 */
export function debounce<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  delay: number
): ((...args: TArgs) => void) & { cancel: () => void } {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: TArgs): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };

  debounced.cancel = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}
