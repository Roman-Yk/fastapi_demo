/**
 * Centralized notification service using Mantine notifications
 * Provides consistent toast notifications across the application
 */

import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';

interface NotificationOptions {
  title?: string;
  autoClose?: number | false;
  withCloseButton?: boolean;
}

/**
 * Notification service for displaying toast messages
 * Uses Mantine notifications positioned at bottom-right to not block content
 */
class NotificationService {
  /**
   * Show success notification
   */
  success(message: string, options?: NotificationOptions) {
    notifications.show({
      message,
      color: 'green',
      icon: <IconCheck size={16} />,
      position: 'bottom-right',
      autoClose: 3000,
      ...options
    });
  }

  /**
   * Show error notification
   */
  error(message: string, options?: NotificationOptions) {
    notifications.show({
      message,
      color: 'red',
      icon: <IconX size={16} />,
      position: 'bottom-right',
      autoClose: 5000,
      ...options
    });
  }

  /**
   * Show warning notification
   */
  warning(message: string, options?: NotificationOptions) {
    notifications.show({
      message,
      color: 'yellow',
      icon: <IconAlertCircle size={16} />,
      position: 'bottom-right',
      autoClose: 4000,
      ...options
    });
  }

  /**
   * Show info notification
   */
  info(message: string, options?: NotificationOptions) {
    notifications.show({
      message,
      color: 'blue',
      icon: <IconInfoCircle size={16} />,
      position: 'bottom-right',
      autoClose: 3000,
      ...options
    });
  }

  /**
   * Show validation error notification with field context
   */
  validationError(field: string, message: string) {
    this.error(message, {
      title: `Validation Error: ${field}`
    });
  }
}

// Export singleton instance
export const notify = new NotificationService();
