import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './app/App.jsx'
import { theme } from './theme/index.js'

// Import Mantine styles
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Notifications />
        <App />
      </ThemeProvider>
    </MantineProvider>
  </React.StrictMode>,
)
