import React, { Component, ReactNode } from 'react';
import { Alert, Button, Container, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: any) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <Container size="sm" py="xl">
    <Stack gap="lg" align="center">
      <Alert
        icon={<IconAlertTriangle size={24} />}
        title="Something went wrong"
        color="red"
        variant="light"
      >
        <Stack gap="sm">
          <Text size="sm">
            An unexpected error occurred. This has been logged and we'll look into it.
          </Text>
          
          {import.meta.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                Error Details (Development)
              </summary>
              <pre style={{ 
                fontSize: '0.75rem', 
                overflow: 'auto', 
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px'
              }}>
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
          
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={resetError}
            variant="light"
            size="sm"
            style={{ alignSelf: 'flex-start' }}
          >
            Try Again
          </Button>
        </Stack>
      </Alert>
    </Stack>
  </Container>
);

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service in production
    this.logError(error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: any) => {
    if (import.meta.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    } else {
      // In production, send to error reporting service
      // Example: Sentry, LogRocket, etc.
      console.error('Error caught by boundary:', error);
    }
  };

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for throwing errors that will be caught by ErrorBoundary
export const useErrorHandler = () => {
  return React.useCallback((error: Error) => {
    // In development, also log to console
    if (import.meta.env.NODE_ENV === 'development') {
      console.error('Error thrown via useErrorHandler:', error);
    }
    
    // Throw the error to be caught by ErrorBoundary
    throw error;
  }, []);
};

export default ErrorBoundary;