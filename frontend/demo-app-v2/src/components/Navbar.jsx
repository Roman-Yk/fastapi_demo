import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { IconBell, IconUser } from '@tabler/icons-react'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Orders', path: '/orders' },
    { label: 'Customers', path: '/customers' },
    { label: 'Products', path: '/products' },
  ]

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Demo App v2
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mr: 3 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" size="small">
            <IconBell size={20} />
          </Button>
          <Button color="inherit" size="small">
            <IconUser size={20} />
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
