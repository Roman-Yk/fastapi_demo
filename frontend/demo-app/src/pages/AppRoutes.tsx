import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ErrorPage } from '../components/common/ErrorPage';

// Lazy load page components for better performance
const OrdersPage = lazy(() => import('../domains/orders/pages/OrdersPage').then(m => ({ default: m.OrdersPage })));
const CreateOrderPage = lazy(() => import('../domains/orders/pages/CreateOrderPage').then(m => ({ default: m.CreateOrderPage })));
const EditOrderPage = lazy(() => import('../domains/orders/pages/EditOrderPage').then(m => ({ default: m.EditOrderPage })));

/**
 * Loading fallback component for lazy-loaded routes
 */
const PageLoader: React.FC = () => (
  <Center style={{ minHeight: '50vh' }}>
    <Stack align="center" gap="md">
      <Loader size="lg" />
      <Text size="sm" c="dimmed">
        Loading...
      </Text>
    </Stack>
  </Center>
);

/**
 * Application routing with error boundaries
 */
export const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary fallback={ErrorPage}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Orders Routes */}
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <OrdersPage />
              </ErrorBoundary>
            }
          />
          <Route path="/orders" element={<Navigate to="/" replace />} />
          <Route
            path="/orders/create"
            element={
              <ErrorBoundary>
                <CreateOrderPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/orders/:orderId/edit"
            element={
              <ErrorBoundary>
                <EditOrderPage />
              </ErrorBoundary>
            }
          />

          {/* Catch-all route - redirect to orders */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}; 