// FLOCKNODE Error Handler Utility
// Provides centralized error handling for all API calls and user interactions

import { toast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class FlockNodeError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'FlockNodeError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const ErrorCodes = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Business logic errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  MATCH_FULL: 'MATCH_FULL',
  MATCH_NOT_FOUND: 'MATCH_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // System errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Error handler configuration
export interface ErrorHandlerConfig {
  showToast?: boolean;
  logToConsole?: boolean;
  fallbackMessage?: string;
  retryable?: boolean;
  maxRetries?: number;
}

// Default error handler configuration
const defaultConfig: ErrorHandlerConfig = {
  showToast: true,
  logToConsole: true,
  fallbackMessage: 'An unexpected error occurred. Please try again.',
  retryable: false,
  maxRetries: 3
};

// Error messages mapping
const errorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.AUTH_REQUIRED]: 'Please log in to continue',
  [ErrorCodes.AUTH_INVALID]: 'Invalid login credentials',
  [ErrorCodes.AUTH_EXPIRED]: 'Your session has expired. Please log in again',
  
  [ErrorCodes.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection',
  [ErrorCodes.TIMEOUT]: 'Request timed out. Please try again',
  [ErrorCodes.SERVER_ERROR]: 'Server error occurred. Please try again later',
  
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input provided',
  
  [ErrorCodes.INSUFFICIENT_FUNDS]: 'Insufficient funds for this transaction',
  [ErrorCodes.MATCH_FULL]: 'This match is full and cannot accept more players',
  [ErrorCodes.MATCH_NOT_FOUND]: 'Match not found or no longer available',
  [ErrorCodes.USER_NOT_FOUND]: 'User not found',
  
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable'
};

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Get error severity based on error code
export function getErrorSeverity(error: FlockNodeError): ErrorSeverity {
  if (error.status && error.status >= 500) {
    return ErrorSeverity.CRITICAL;
  }
  
  if (error.status && error.status >= 400) {
    return ErrorSeverity.HIGH;
  }
  
  if (error.code === ErrorCodes.NETWORK_ERROR || error.code === ErrorCodes.TIMEOUT) {
    return ErrorSeverity.MEDIUM;
  }
  
  return ErrorSeverity.LOW;
}

// Format error message for display
export function formatErrorMessage(error: FlockNodeError, config: ErrorHandlerConfig = {}): string {
  const finalConfig = { ...defaultConfig, ...config };
  
  // Use specific error message if available
  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code];
  }
  
  // Use error message if available
  if (error.message) {
    return error.message;
  }
  
  // Use fallback message
  return finalConfig.fallbackMessage || 'An unexpected error occurred';
}

// Handle error with full configuration
export function handleError(
  error: unknown,
  config: ErrorHandlerConfig = {}
): void {
  const finalConfig = { ...defaultConfig, ...config };
  
  // Convert error to FlockNodeError
  let flockError: FlockNodeError;
  
  if (error instanceof FlockNodeError) {
    flockError = error;
  } else if (error instanceof Error) {
    flockError = new FlockNodeError(error.message);
  } else if (typeof error === 'string') {
    flockError = new FlockNodeError(error);
  } else {
    flockError = new FlockNodeError('An unknown error occurred');
  }
  
  // Log to console if enabled
  if (finalConfig.logToConsole) {
    const severity = getErrorSeverity(flockError);
    const logLevel = severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH 
      ? 'error' 
      : 'warn';
    
    console[logLevel]('FLOCKNODE Error:', {
      message: flockError.message,
      status: flockError.status,
      code: flockError.code,
      details: flockError.details,
      severity
    });
  }
  
  // Show toast notification if enabled
  if (finalConfig.showToast) {
    const message = formatErrorMessage(flockError, finalConfig);
    const severity = getErrorSeverity(flockError);
    
    toast({
      title: getErrorTitle(severity),
      description: message,
      variant: getToastVariant(severity)
    });
  }
}

// Get error title based on severity
function getErrorTitle(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return 'Critical Error';
    case ErrorSeverity.HIGH:
      return 'Error';
    case ErrorSeverity.MEDIUM:
      return 'Warning';
    case ErrorSeverity.LOW:
      return 'Notice';
    default:
      return 'Error';
  }
}

// Get toast variant based on severity
function getToastVariant(severity: ErrorSeverity): 'default' | 'destructive' {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.HIGH:
      return 'destructive';
    case ErrorSeverity.MEDIUM:
    case ErrorSeverity.LOW:
    default:
      return 'default';
  }
}

// API error handler wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  config: ErrorHandlerConfig = {}
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, config);
      return null;
    }
  };
}

// Retry wrapper for retryable operations
export function withRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  maxRetries: number = 3,
  delay: number = 1000
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error instanceof FlockNodeError) {
          if (error.code === ErrorCodes.AUTH_REQUIRED || 
              error.code === ErrorCodes.AUTH_INVALID ||
              error.code === ErrorCodes.VALIDATION_ERROR) {
            throw error;
          }
        }
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
    
    throw lastError;
  };
}

// Network error detector
export function isNetworkError(error: unknown): boolean {
  if (error instanceof FlockNodeError) {
    return error.code === ErrorCodes.NETWORK_ERROR || 
           error.code === ErrorCodes.TIMEOUT ||
           error.code === ErrorCodes.SERVICE_UNAVAILABLE;
  }
  
  if (error instanceof Error) {
    return error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('timeout');
  }
  
  return false;
}

// Authentication error detector
export function isAuthError(error: unknown): boolean {
  if (error instanceof FlockNodeError) {
    return error.code === ErrorCodes.AUTH_REQUIRED ||
           error.code === ErrorCodes.AUTH_INVALID ||
           error.code === ErrorCodes.AUTH_EXPIRED;
  }
  
  if (error instanceof Error) {
    return error.message.includes('unauthorized') ||
           error.message.includes('authentication') ||
           error.message.includes('login');
  }
  
  return false;
}

// Validation error detector
export function isValidationError(error: unknown): boolean {
  if (error instanceof FlockNodeError) {
    return error.code === ErrorCodes.VALIDATION_ERROR ||
           error.code === ErrorCodes.INVALID_INPUT;
  }
  
  if (error instanceof Error) {
    return error.message.includes('validation') ||
           error.message.includes('invalid') ||
           error.message.includes('required');
  }
  
  return false;
}

// Business logic error detector
export function isBusinessError(error: unknown): boolean {
  if (error instanceof FlockNodeError) {
    return error.code === ErrorCodes.INSUFFICIENT_FUNDS ||
           error.code === ErrorCodes.MATCH_FULL ||
           error.code === ErrorCodes.MATCH_NOT_FOUND ||
           error.code === ErrorCodes.USER_NOT_FOUND;
  }
  
  return false;
}

// Create error from API response
export function createErrorFromResponse(response: Response, data?: any): FlockNodeError {
  const status = response.status;
  let code: ErrorCode = ErrorCodes.UNKNOWN_ERROR;
  let message = data?.message || 'An error occurred';
  
  // Map HTTP status codes to error codes
  if (status === 401) {
    code = ErrorCodes.AUTH_REQUIRED;
  } else if (status === 403) {
    code = ErrorCodes.AUTH_INVALID;
  } else if (status === 400) {
    code = ErrorCodes.VALIDATION_ERROR;
  } else if (status === 404) {
    code = ErrorCodes.MATCH_NOT_FOUND;
  } else if (status === 409) {
    code = ErrorCodes.MATCH_FULL;
  } else if (status >= 500) {
    code = ErrorCodes.SERVER_ERROR;
  }
  
  return new FlockNodeError(message, status, code, data);
}

// Create network error
export function createNetworkError(error: unknown): FlockNodeError {
  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return new FlockNodeError('Request timed out', 0, ErrorCodes.TIMEOUT);
    }
    if (error.message.includes('fetch')) {
      return new FlockNodeError('Network connection failed', 0, ErrorCodes.NETWORK_ERROR);
    }
  }
  
  return new FlockNodeError('Network error occurred', 0, ErrorCodes.NETWORK_ERROR);
}

// Export default error handler
export const errorHandler = {
  handle: handleError,
  withErrorHandling,
  withRetry,
  createErrorFromResponse,
  createNetworkError,
  isNetworkError,
  isAuthError,
  isValidationError,
  isBusinessError,
  getErrorSeverity,
  formatErrorMessage
};

export default errorHandler;





