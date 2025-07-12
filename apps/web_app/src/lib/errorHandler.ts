/**
 * Error handling utilities for the web application
 */

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export class AuthError extends Error {
  public code: string;
  public details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends Error {
  public code: string;
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'NetworkError';
    this.code = 'NETWORK_ERROR';
    this.status = status;
  }
}

/**
 * Handles authentication-related errors and provides user-friendly messages
 */
export function handleAuthError(error: unknown): AppError {
  if (error instanceof AuthError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details
    };
  }

  if (error instanceof Error) {
    // Handle specific Supabase auth errors
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return {
        code: 'AUTH_FORBIDDEN',
        message: 'Session expired or invalid. Please sign in again.',
        details: error.message
      };
    }

    if (error.message.includes('WebSocket')) {
      return {
        code: 'WEBSOCKET_ERROR',
        message: 'Connection issue detected. This may affect real-time features.',
        details: error.message
      };
    }

    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return {
        code: 'RATE_LIMIT',
        message: 'Too many requests. Please wait a moment before trying again.',
        details: error.message
      };
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection issue. Please check your internet connection.',
        details: error.message
      };
    }

    return {
      code: 'UNKNOWN_AUTH_ERROR',
      message: error.message || 'An authentication error occurred',
      details: error
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: error
  };
}

/**
 * Safely executes an async operation with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const appError = handleAuthError(error);
    console.error(`Operation failed [${appError.code}]:`, appError.message, appError.details);
    return { success: false, error: appError };
  }
}

/**
 * Logs errors in a consistent format
 */
export function logError(context: string, error: unknown, additionalInfo?: Record<string, unknown>): void {
  const appError = handleAuthError(error);
  console.error(`[${context}] ${appError.code}: ${appError.message}`, {
    details: appError.details,
    ...additionalInfo
  });
}
