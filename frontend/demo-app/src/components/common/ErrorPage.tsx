import React from 'react';
import { Container, Title, Text, Button, Stack, Paper } from '@mantine/core';
import { IconAlertCircle, IconHome } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  error: Error;
  resetError: () => void;
}

/**
 * Full-page error display component
 * Used as fallback for error boundaries
 */
export const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    resetError();
    navigate('/');
  };

  const handleReload = () => {
    resetError();
    window.location.reload();
  };

  return (
    <Container size="sm" style={{ marginTop: '10%' }}>
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <IconAlertCircle size={64} color="red" />
          <Title order={2}>Something went wrong</Title>
          <Text size="md" c="dimmed" ta="center">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </Text>

          {import.meta.env.MODE === 'development' && error.stack && (
            <Paper bg="gray.1" p="md" style={{ width: '100%', overflow: 'auto' }}>
              <Text size="xs" ff="monospace" style={{ whiteSpace: 'pre-wrap' }}>
                {error.stack}
              </Text>
            </Paper>
          )}

          <Stack gap="sm" style={{ width: '100%' }}>
            <Button
              fullWidth
              leftSection={<IconHome size={16} />}
              onClick={handleGoHome}
            >
              Go to Home
            </Button>
            <Button fullWidth variant="outline" onClick={handleReload}>
              Reload Page
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ErrorPage;
