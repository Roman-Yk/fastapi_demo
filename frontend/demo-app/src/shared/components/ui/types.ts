// Base filter props interface
export interface FilterProps {
  source: string;
  label?: string;
  alwaysOn?: boolean;
  value?: any;
  onChange?: (value: any) => void;
}