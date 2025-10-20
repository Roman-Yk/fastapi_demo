/**
 * Tests for DataLoader component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataLoader } from '../../components/common/DataLoader';
import { BaseApiError } from '../../services/baseApiService';
import { MantineProvider } from '@mantine/core';

// Wrapper component for Mantine
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('DataLoader', () => {
  it('renders children when not loading and no error', () => {
    render(
      <DataLoader loading={false} error={null}>
        <div>Test Content</div>
      </DataLoader>,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <DataLoader loading={true} error={null}>
        <div>Test Content</div>
      </DataLoader>,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state with error message', () => {
    const error = new BaseApiError('Test error message', 500);

    render(
      <DataLoader loading={false} error={error}>
        <div>Test Content</div>
      </DataLoader>,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('shows empty state when isEmpty is true', () => {
    render(
      <DataLoader loading={false} error={null} isEmpty={true}>
        <div>Test Content</div>
      </DataLoader>,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn();
    const error = new BaseApiError('Test error', 500);

    const { getByText } = render(
      <DataLoader loading={false} error={error} onRetry={onRetry}>
        <div>Test Content</div>
      </DataLoader>,
      { wrapper: Wrapper }
    );

    const retryButton = getByText('Retry');
    retryButton.click();

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
