import React, { useRef, useState, useEffect } from 'react';
import { Text, Tooltip } from '@mantine/core';
import { FieldProps } from './types';

export interface TooltipFieldProps extends FieldProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: number;
  color?: string;
  lineClamp?: number;
  transform?: 'capitalize' | 'lowercase' | 'uppercase' | 'none';
  maxWidth?: string | number;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  alwaysShowTooltip?: boolean;
  customTooltipContent?: string;
  // Mapping from value to display options and tooltip content
  valueMap?: Record<any, { 
    label?: string; 
    tooltip?: string; 
    color?: string;
  }>;
}

export const TooltipField: React.FC<TooltipFieldProps> = ({ 
  value, 
  record, 
  source,
  size = 'sm',
  weight,
  color,
  lineClamp = 1,
  transform,
  maxWidth,
  tooltipPosition = 'top',
  alwaysShowTooltip = false,
  customTooltipContent,
  valueMap,
  ...props 
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  
  // If we have a record and source, get the value from record[source]
  const rawValue = value !== undefined ? value : record?.[source];
  
  // Check if we have a mapping for this value
  const mapping = valueMap?.[rawValue];
  const displayValue = mapping?.label || rawValue;
  const tooltipContent = customTooltipContent || mapping?.tooltip || displayValue;
  const textColor = mapping?.color || color;
  
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && !alwaysShowTooltip) {
        const element = textRef.current;
        // Check if content is truncated either by lineClamp or maxWidth
        const isTextOverflowing = element.scrollHeight > element.clientHeight || 
                                element.scrollWidth > element.clientWidth;
        setIsOverflowing(isTextOverflowing);
      }
    };

    checkOverflow();
    
    // Recheck on window resize
    const handleResize = () => checkOverflow();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [displayValue, alwaysShowTooltip, lineClamp, maxWidth]);
  
  if (displayValue == null) {
    return <Text size={size} c="dimmed">-</Text>;
  }
  
  const textContent = (
    <Text 
      ref={textRef}
      size={size}
      fw={weight}
      c={textColor}
      lineClamp={lineClamp}
      tt={transform}
      style={{ 
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: lineClamp === 1 ? 'nowrap' : 'normal'
      }}
      {...props}
    >
      {displayValue}
    </Text>
  );
  
  // Show tooltip if content is overflowing, alwaysShowTooltip is true, or we have tooltip content
  const shouldShowTooltip = alwaysShowTooltip || isOverflowing || (tooltipContent && tooltipContent !== displayValue);
  
  if (shouldShowTooltip) {
    return (
      <Tooltip
        label={tooltipContent}
        position={tooltipPosition}
        multiline={typeof tooltipContent === 'string' && tooltipContent.length > 50}
        withArrow
      >
        <div style={{ display: 'inline-block', maxWidth: '100%' }}>
          {textContent}
        </div>
      </Tooltip>
    );
  }
  
  return textContent;
};