import React from 'react';
import { Anchor } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { FieldProps } from './types';

export interface LinkFieldProps extends FieldProps {
  to?: string; // URL template, e.g., "/orders/{id}/edit"
  target?: '_blank' | '_self' | '_parent' | '_top';
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  underline?: 'always' | 'hover' | 'never';
  component?: 'a' | 'button';
}

export const LinkField: React.FC<LinkFieldProps> = ({
  source,
  _label,
  record,
  value,
  to,
  target = '_self',
  color = 'blue',
  size = 'sm',
  underline = 'hover',
  component = 'a',
  ...props
}) => {
  const navigate = useNavigate();
  const displayValue = value !== undefined ? value : record?.[source];
  
  if (!displayValue) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    if (to && target === '_self') {
      e.preventDefault();
      // Replace placeholders in URL template with record values
      let url = to;
      if (record) {
        Object.entries(record).forEach(([key, val]) => {
          url = url.replace(`{${key}}`, String(val));
        });
      }
      navigate(url);
    }
  };
  
  const href = to && record ? 
    Object.entries(record).reduce((url, [key, val]) => 
      url.replace(`{${key}}`, String(val)), to
    ) : '#';
  
  return (
    <Anchor
      href={href}
      target={target}
      color={color}
      size={size}
      underline={underline}
      component={component}
      onClick={handleClick}
      {...props}
    >
      {displayValue}
    </Anchor>
  );
};