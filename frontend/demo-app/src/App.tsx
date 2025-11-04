import { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import {
  MantineProvider,
  AppShell,
  createTheme,
  MantineColorsTuple
} from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import { ThemeProvider, createTheme as createMuiTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Navbar } from './components/layout';
import { AppRoutes } from './pages/AppRoutes';

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

// App content component - light theme only
const AppContent = () => {
  // Material-UI theme - light mode only
  const muiTheme = useMemo(() => createMuiTheme({
    palette: {
      mode: 'light',
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
  }), []);

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
      <MantineProvider theme={mantineTheme} forceColorScheme="light">
        <DatesProvider settings={{ firstDayOfWeek: 1 }}>
          <Notifications />
          <AppContent />
        </DatesProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App; 