import React from 'react'
import { Paper, Typography, Breadcrumbs, Link, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const PageHeader = ({ title, breadcrumbs = [], actions = null }) => {
  const navigate = useNavigate()

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          {breadcrumbs.length > 0 && (
            <Breadcrumbs sx={{ mb: 1 }}>
              {breadcrumbs.map((crumb, index) => (
                <Link
                  key={index}
                  color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                  onClick={() => crumb.path && navigate(crumb.path)}
                  sx={{ 
                    cursor: crumb.path ? 'pointer' : 'default',
                    textDecoration: 'none',
                    '&:hover': crumb.path ? { textDecoration: 'underline' } : {}
                  }}
                >
                  {crumb.label}
                </Link>
              ))}
            </Breadcrumbs>
          )}
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        
        {actions && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default PageHeader
