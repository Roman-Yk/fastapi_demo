import React from 'react';
import { Stack, Title } from '@mantine/core';

interface GroupGridProps {
  title?: string;
  children: React.ReactNode;
}

export const GroupGrid: React.FC<GroupGridProps> = ({ title, children }) => {
  return (
    <Stack gap="sm">
      {title && <Title order={4} size="md" c="dimmed">{title}</Title>}
      {children}
    </Stack>
  );
};