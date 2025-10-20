
// Action Components
export * from './ActionButton';

// Error Handling Components
export * from './ErrorBoundary';
export * from './ErrorPage';

// Data Loading Components
export * from './DataLoader';

// Re-export commonly used Mantine components with consistent naming
export { 
  Paper as Card,
  Stack as VStack,
  Group as HStack,
  Text as Typography,
  Title as Heading,
  Badge as Chip,
  Divider as Separator,
  Box as Container,
  Flex as FlexBox,
  Grid as GridLayout,
  Space as Spacer,
  Loader as Spinner,
  Alert as Notice,
  Modal as Dialog,
  Menu as Dropdown,
  Tabs as TabContainer,
  Accordion as Collapsible,
  Tooltip as Hint,
  Skeleton as Placeholder
} from '@mantine/core'; 