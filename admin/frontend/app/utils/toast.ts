/**
 * Toast Notification Utilities
 * Themed notification system using react-hot-toast
 * Replaces ugly browser alert() popups with beautiful themed toasts
 */

import toast from 'react-hot-toast';

/**
 * Show success notification
 * @param message - Success message to display
 * @param options - Optional toast options
 */
export const showSuccess = (message: string, options?: any) => {
  return toast.success(message, {
    ...options,
    style: {
      ...options?.style,
      fontWeight: '500',
    },
  });
};

/**
 * Show error notification
 * @param message - Error message to display
 * @param options - Optional toast options
 */
export const showError = (message: string, options?: any) => {
  return toast.error(message, {
    ...options,
    style: {
      ...options?.style,
      fontWeight: '500',
    },
  });
};

/**
 * Show info notification
 * @param message - Info message to display
 * @param options - Optional toast options
 */
export const showInfo = (message: string, options?: any) => {
  return toast(message, {
    ...options,
    icon: 'ℹ️',
    style: {
      ...options?.style,
      border: '1px solid #3b82f6',
    },
  });
};

/**
 * Show warning notification
 * @param message - Warning message to display
 * @param options - Optional toast options
 */
export const showWarning = (message: string, options?: any) => {
  return toast(message, {
    ...options,
    icon: '⚠️',
    style: {
      ...options?.style,
      border: '1px solid #f59e0b',
      background: '#fffbeb',
    },
  });
};

/**
 * Show loading notification
 * @param message - Loading message to display
 * @returns toast ID (use with toast.dismiss(id) to remove)
 */
export const showLoading = (message: string = 'Loading...') => {
  return toast.loading(message);
};

/**
 * Show promise-based notification
 * Automatically shows loading, success, or error based on promise state
 * @param promise - Promise to track
 * @param messages - Messages for loading, success, and error states
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages);
};

/**
 * Dismiss a specific toast or all toasts
 * @param toastId - Optional toast ID to dismiss. If not provided, dismisses all toasts
 */
export const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

/**
 * Show custom toast with custom content
 * @param content - Custom JSX content
 * @param options - Toast options
 */
export const showCustom = (content: React.ReactNode, options?: any) => {
  return toast.custom(content, options);
};

// Export the main toast object for advanced use cases
export { toast };

// Type exports for TypeScript
export type ToastOptions = {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  style?: React.CSSProperties;
  className?: string;
  icon?: React.ReactNode;
  iconTheme?: {
    primary: string;
    secondary: string;
  };
};
