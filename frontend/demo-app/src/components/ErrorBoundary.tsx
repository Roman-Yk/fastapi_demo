import { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Title, Text, Button, Stack, Paper } from '@mantine/core';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" py="xl">
          <Paper p="xl" withBorder>
            <Stack gap="md">
              <Title order={2} c="red">Something went wrong</Title>
              <Text c="dimmed">
                An error occurred while rendering this component.
              </Text>
              {this.state.error && (
                <Paper p="md" bg="gray.0" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                  <Text fw={600}>Error:</Text>
                  <Text>{this.state.error.toString()}</Text>
                  {this.state.errorInfo && (
                    <>
                      <Text fw={600} mt="md">Stack trace:</Text>
                      <Text style={{ whiteSpace: 'pre-wrap', fontSize: '11px' }}>
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </>
                  )}
                </Paper>
              )}
              <Button onClick={this.handleReset}>
                Reload Page
              </Button>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}
