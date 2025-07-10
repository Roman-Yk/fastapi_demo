import { useState, useMemo } from 'react';
import { 
  MantineProvider, 
  AppShell, 
  Container, 
  Stack,
  createTheme,
  MantineColorsTuple,
  useMantineColorScheme
} from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import { ThemeProvider, createTheme as createMuiTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Navbar } from './components/Navbar';
import { OrderFiltersComponent } from './components/OrderFilters';
import { OrderGrid } from './components/OrderGrid';
import { mockOrders, filterOrders } from './utils/mockData';
import { OrderFilters, DateFilterOption } from './types/order';

// Custom color palette
const customBlue: MantineColorsTuple = [
  '#e7f5ff',
  '#d0ebff',
  '#a5d8ff',
  '#74c0fc',
  '#339af0',
  '#228be6',
  '#1c7ed6',
  '#1864ab',
  '#0b4a8a',
  '#002f6c'
];

// Mantine theme
const mantineTheme = createTheme({
  colors: {
    customBlue,
  },
  primaryColor: 'customBlue',
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
});

// App content component that uses the theme
const AppContent = () => {
  const { colorScheme } = useMantineColorScheme();
  
  // Material-UI theme that responds to color scheme
  const muiTheme = useMemo(() => createMuiTheme({
    palette: {
      mode: colorScheme === 'dark' ? 'dark' : 'light',
      primary: {
        main: '#228be6',
      },
      secondary: {
        main: '#fa5252',
      },
    },
    typography: {
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    },
  }), [colorScheme]);

  const [filters, setFilters] = useState<OrderFilters>({
    dateFilter: DateFilterOption.TODAY, // Default to today
    locationFilter: null,
    statusFilter: null,
    serviceFilter: null,
    commodityFilter: null,
    priorityFilter: null,
    searchText: '',
    inTerminal: false,
  });

  const [loading, setLoading] = useState(false);

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    return filterOrders(mockOrders, filters);
  }, [filters]);

  const handleFiltersChange = (newFilters: OrderFilters) => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setFilters(newFilters);
      setLoading(false);
    }, 300);
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AppShell
        header={{ height: 84 }}
        padding="md"
      >
        <Navbar />
        
        <AppShell.Main>
          <Container size="100%" px="xl" py="sm">
            <Stack gap="sm">
              <OrderFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                totalOrders={mockOrders.length}
                filteredOrders={filteredOrders.length}
              />
              
              <OrderGrid
                orders={filteredOrders}
                loading={loading}
              />
            </Stack>
          </Container>
        </AppShell.Main>
      </AppShell>
    </ThemeProvider>
  );
};

function App() {
  return (
    <MantineProvider theme={mantineTheme}>
      <DatesProvider settings={{ firstDayOfWeek: 1 }}>
        <Notifications />
        <AppContent />
      </DatesProvider>
    </MantineProvider>
  );
}

export default App; 