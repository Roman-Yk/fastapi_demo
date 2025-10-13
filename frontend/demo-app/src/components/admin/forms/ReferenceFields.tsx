import { ReferenceField } from './ReferenceField';

// Driver Reference Field
interface DriverReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  transform?: (value: any) => any;
}

export function DriverReferenceField<K extends string>(props: DriverReferenceFieldProps<K>) {
  return (
    <ReferenceField
      {...props}
      resource="drivers"
      getOptionLabel={(driver) => `${driver.name}${driver.phone ? ` (${driver.phone})` : ''}`}
    />
  );
}

// Terminal Reference Field
interface TerminalReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  transform?: (value: any) => any;
}

export function TerminalReferenceField<K extends string>(props: TerminalReferenceFieldProps<K>) {
  return (
    <ReferenceField
      {...props}
      resource="terminals"
      getOptionLabel={(terminal) => `${terminal.name} (${terminal.code})`}
    />
  );
}

// Truck Reference Field
interface TruckReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  transform?: (value: any) => any;
}

export function TruckReferenceField<K extends string>(props: TruckReferenceFieldProps<K>) {
  return (
    <ReferenceField
      {...props}
      resource="trucks"
      getOptionLabel={(truck) => {
        const details = [truck.make, truck.model, truck.year].filter(Boolean).join(' ');
        return `${truck.truck_number}${details ? ` (${details})` : ''}`;
      }}
    />
  );
}

// Trailer Reference Field
interface TrailerReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  transform?: (value: any) => any;
}

export function TrailerReferenceField<K extends string>(props: TrailerReferenceFieldProps<K>) {
  return (
    <ReferenceField
      {...props}
      resource="trailers"
      getOptionLabel={(trailer) => {
        const details = [trailer.type, trailer.capacity ? `${trailer.capacity}kg` : null]
          .filter(Boolean).join(', ');
        return `${trailer.license_plate}${details ? ` (${details})` : ''}`;
      }}
    />
  );
}