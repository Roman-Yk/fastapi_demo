import { Text, Badge, Skeleton, Group } from '@mantine/core';
import { useReference } from '../../../hooks/useReference';
import ApiService, { Driver, Terminal, Truck, Trailer } from '../../../services/apiService';

interface ReferenceDisplayProps {
  resource: string;
  id: string | null;
  fetchRecord: (id: string) => Promise<any>;
  renderRecord: (record: any) => React.ReactNode;
  placeholder?: string;
}

function ReferenceDisplay({ 
  resource, 
  id, 
  fetchRecord, 
  renderRecord, 
  placeholder = 'Not selected' 
}: ReferenceDisplayProps) {
  const { record, loading, error } = useReference(resource, id, fetchRecord);

  if (loading) {
    return <Skeleton height={20} width={120} />;
  }

  if (error) {
    return <Text size="sm" c="red">Error loading {resource}</Text>;
  }

  if (!record) {
    return <Text size="sm" c="dimmed">{placeholder}</Text>;
  }

  return <>{renderRecord(record)}</>;
}

// Specific display components for each resource type

interface DriverDisplayProps {
  driverId: string | null;
  placeholder?: string;
}

export function DriverDisplay({ driverId, placeholder }: DriverDisplayProps) {
  return (
    <ReferenceDisplay
      resource="drivers"
      id={driverId}
      fetchRecord={(id) => ApiService.getDriver(id)}
      placeholder={placeholder}
      renderRecord={(driver: Driver) => (
        <Group gap="xs">
          <Badge variant="light" color="blue">
            {driver.name}
          </Badge>
          {driver.phone && (
            <Text size="xs" c="dimmed">
              {driver.phone}
            </Text>
          )}
        </Group>
      )}
    />
  );
}

interface TerminalDisplayProps {
  terminalId: string | null;
  placeholder?: string;
}

export function TerminalDisplay({ terminalId, placeholder }: TerminalDisplayProps) {
  return (
    <ReferenceDisplay
      resource="terminals"
      id={terminalId}
      fetchRecord={(id) => ApiService.getTerminal(id)}
      placeholder={placeholder}
      renderRecord={(terminal: Terminal) => (
        <Group gap="xs">
          <Badge variant="light" color="green">
            {terminal.name}
          </Badge>
          <Text size="xs" c="dimmed">
            {terminal.code}
          </Text>
        </Group>
      )}
    />
  );
}

interface TruckDisplayProps {
  truckId: string | null;
  placeholder?: string;
}

export function TruckDisplay({ truckId, placeholder }: TruckDisplayProps) {
  return (
    <ReferenceDisplay
      resource="trucks"
      id={truckId}
      fetchRecord={(id) => ApiService.getTruck(id)}
      placeholder={placeholder}
      renderRecord={(truck: Truck) => (
        <Group gap="xs">
          <Badge variant="light" color="orange">
            {truck.truck_number}
          </Badge>
          {(truck.make || truck.model) && (
            <Text size="xs" c="dimmed">
              {[truck.make, truck.model].filter(Boolean).join(' ')}
            </Text>
          )}
        </Group>
      )}
    />
  );
}

interface TrailerDisplayProps {
  trailerId: string | null;
  placeholder?: string;
}

export function TrailerDisplay({ trailerId, placeholder }: TrailerDisplayProps) {
  return (
    <ReferenceDisplay
      resource="trailers"
      id={trailerId}
      fetchRecord={(id) => ApiService.getTrailer(id)}
      placeholder={placeholder}
      renderRecord={(trailer: Trailer) => (
        <Group gap="xs">
          <Badge variant="light" color="purple">
            {trailer.license_plate}
          </Badge>
          {trailer.type && (
            <Text size="xs" c="dimmed">
              {trailer.type}
            </Text>
          )}
        </Group>
      )}
    />
  );
}