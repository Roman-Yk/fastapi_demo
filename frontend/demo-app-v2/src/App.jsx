import { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { 
  MantineProvider, 
  AppShell, 
  createTheme,
  useMantineColorScheme
} from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import { ThemeProvider, createTheme as createMuiTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Navbar } from './components/layout';
import { AppRoutes } from './components/routing';

// Custom color palette
const customBlue = [
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

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AppShell
        header={{ height: 84 }}
        padding="md"
      >
        <Navbar />
        
        <AppShell.Main>
          <AppRoutes />
        </AppShell.Main>
      </AppShell>
    </ThemeProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <MantineProvider theme={mantineTheme}>
        <DatesProvider settings={{ firstDayOfWeek: 1 }}>
          <Notifications />
          <AppContent />
        </DatesProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
