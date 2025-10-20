import React from 'react';
import { Grid as MantineGrid } from '@mantine/core';

interface GridProps {
  children: React.ReactNode;
  gutter?: string | number;
}

export const Grid: React.FC<GridProps> = ({ children, gutter = "md" }) => {
  return (
    <MantineGrid gutter={gutter}>
      {children}
    </MantineGrid>
  );
};

interface GridColProps {
  children: React.ReactNode;
  span: number;
  offset?: number;
}

export const GridCol: React.FC<GridColProps> = ({ children, span, offset }) => {
  return (
    <MantineGrid.Col span={span} offset={offset}>
      {children}
    </MantineGrid.Col>
  );
};