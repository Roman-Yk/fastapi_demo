import React from 'react'
import { TextField, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material'

// Basic form field component for future expansion
const FormField = ({ type, label, value, onChange, error, helperText, options = [], ...props }) => {
  switch (type) {
    case 'select':
      return (
        <FormControl fullWidth error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Select
            value={value}
            label={label}
            onChange={(e) => onChange(e.target.value)}
            {...props}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      )
    
    case 'text':
    case 'email':
    case 'number':
    default:
      return (
        <TextField
          fullWidth
          type={type}
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={helperText}
          {...props}
        />
      )
  }
}

// Dynamic form builder component (placeholder for future enhancement)
const FormBuilder = ({ fields, values, onChange, errors = {} }) => {
  return (
    <Grid container spacing={3}>
      {fields.map((field) => (
        <Grid item xs={12} sm={field.gridSize || 6} key={field.name}>
          <FormField
            type={field.type}
            label={field.label}
            value={values[field.name] || ''}
            onChange={(value) => onChange(field.name, value)}
            error={errors[field.name]}
            helperText={errors[field.name]}
            options={field.options}
            {...field.props}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default FormBuilder
