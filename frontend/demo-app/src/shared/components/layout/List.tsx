import React from 'react';
import { Stack, Container } from '@mantine/core';

export interface ListProps {
  children: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
  containerSize?: string | number;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  px?: string | number;
  py?: string | number;
}

export const List: React.FC<ListProps> = ({
  children,
  filters,
  actions,
  title: _title,
  containerSize = "100%",
  spacing = 'sm',
  px = 'xl',
  py = 'sm',
  ...props
}) => {
  return (
    <Container size={containerSize} px={px} py={py} {...props}>
      <Stack gap={spacing}>
        {filters && filters}
        {actions && actions}
        {children}
      </Stack>
    </Container>
  );
};