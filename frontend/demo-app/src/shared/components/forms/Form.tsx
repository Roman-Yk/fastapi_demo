import React from 'react';
import { Paper, Stack } from '@mantine/core';

interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export const Form: React.FC<FormProps> = ({ children, onSubmit, className }) => {
  return (
    <Paper withBorder p="md" className={className}>
      <form onSubmit={onSubmit}>
        <Stack gap="md">
          {children}
        </Stack>
      </form>
    </Paper>
  );
};