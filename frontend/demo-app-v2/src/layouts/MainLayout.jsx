import React from 'react'
import { Box, Container, Toolbar } from '@mui/material'
import Navbar from '../components/Navbar.jsx'

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Toolbar /> {/* This creates space for the fixed AppBar */}
      
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  )
}

export default MainLayout
