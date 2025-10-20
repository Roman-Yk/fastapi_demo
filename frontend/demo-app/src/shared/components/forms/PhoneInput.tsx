import React, { useState, useRef, useEffect } from 'react';
import PhoneInput, { getCountries, getCountryCallingCode, parsePhoneNumber } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en';
import 'react-phone-number-input/style.css';
import './PhoneInput.css';
import { Box, Typography, Popover, List, ListItem, ListItemText, TextField, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import { FlagImage } from 'react-international-phone';
import 'react-international-phone/style.css';

interface StyledLabelProps {
  required?: boolean;
}

// Styled wrapper for the phone input with flag inside
const StyledPhoneInputWrapper = styled(Box)(() => ({
  position: 'relative',
  
  '& .PhoneInput': {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  
  '& .PhoneInputInput': {
    width: '100%',
    padding: '10px 12px 10px 60px', // Extra padding on left for flag
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    backgroundColor: '#fff',
    color: '#212529',
    
    '&:hover': {
      borderColor: '#adb5bd',
    },
    
    '&:focus': {
      borderColor: '#228be6',
      boxShadow: '0 0 0 0.2rem rgba(34, 139, 230, 0.25)',
    },
    
    '&::placeholder': {
      color: '#868e96',
    },
  },
  
  '& .PhoneInputCountry': {
    display: 'none !important', // Hide default country selector
  },
  
  '& .PhoneInputCountryIcon': {
    display: 'none !important',
  },
  
  '& .PhoneInputCountrySelect': {
    display: 'none !important',
  },
}));

const CountryButton = styled(Box)(() => ({
  position: 'absolute',
  left: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  borderRadius: '4px',
  
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const LabelText = styled(Typography)<StyledLabelProps>(({ required }) => ({
  fontSize: '14px',
  fontWeight: 500,
  marginBottom: '6px',
  color: '#212529',
  
  '&::after': required ? {
    content: '" *"',
    color: '#fa5252',
    marginLeft: '4px',
  } : {},
}));

export interface PhoneNumberInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  required?: boolean;
  defaultCountry?: string;
  disabled?: boolean;
  error?: string;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  placeholder = 'Enter phone number',
  value,
  onChange,
  required = false,
  defaultCountry = 'NO', // Default to Norway
  disabled = false,
  error,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const buttonRef = useRef<HTMLDivElement>(null);

  const countries = getCountries();
  const open = Boolean(anchorEl);

  // Sync selected country with the phone number value
  useEffect(() => {
    if (value) {
      try {
        const phoneNumber = parsePhoneNumber(value);
        if (phoneNumber && phoneNumber.country) {
          setSelectedCountry(phoneNumber.country);
        }
      } catch (error) {
        // If parsing fails, keep the default country
      }
    }
  }, [value]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    
    // Set the country calling code when country is selected
    const callingCode = getCountryCallingCode(country as any);
    const newValue = `+${callingCode}`;
    
    // Always set the new country code
    // If there's an existing number, extract just the digits and apply to new country
    if (value && value.length > 0) {
      try {
        const phoneNumber = parsePhoneNumber(value);
        if (phoneNumber && phoneNumber.nationalNumber) {
          // Keep the national number but change the country code
          const newFullNumber = `+${callingCode}${phoneNumber.nationalNumber}`;
          onChange?.(newFullNumber);
        } else {
          // If can't parse, just set the new country code
          onChange?.(newValue);
        }
      } catch {
        // If parsing fails, just set the new country code
        onChange?.(newValue);
      }
    } else {
      // If empty, just set the country code
      onChange?.(newValue);
    }
    
    handleClose();
  };

  const filteredCountries = countries.filter((country) => {
    const countryName = en[country] || country;
    return countryName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Enhanced onChange handler with strict length validation
  const handlePhoneChange = (newValue: string | undefined) => {
    if (!newValue) {
      onChange?.(newValue);
      return;
    }

    // Count only digits (excluding +, spaces, parentheses, hyphens)
    const digitsOnly = newValue.replace(/\D/g, '');
    
    // E.164 standard allows max 15 digits total (country code + national number)
    // But we'll be more lenient to allow formatting characters
    const maxDigits = 15;
    
    if (digitsOnly.length <= maxDigits) {
      onChange?.(newValue);
    }
    // If exceeds max digits, don't call onChange (blocks the input)
  };

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <LabelText required={required}>
          {label}
        </LabelText>
      )}
      
      <StyledPhoneInputWrapper>
        <CountryButton ref={buttonRef} onClick={handleClick}>
          <FlagImage iso2={selectedCountry.toLowerCase()} style={{ width: '24px', height: '18px', borderRadius: '2px' }} />
          <KeyboardArrowDownIcon sx={{ fontSize: '16px', color: '#495057' }} />
        </CountryButton>
        
        <PhoneInput
          international
          country={selectedCountry as any}
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          disabled={disabled}
          countryCallingCodeEditable={false}
          limitMaxLength={true}
        />
      </StyledPhoneInputWrapper>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 320,
            mt: 1,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e9ecef',
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e9ecef' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: '#868e96' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8f9fa',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#adb5bd',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#228be6',
                },
              },
            }}
          />
        </Box>
        
        <List sx={{ p: 0, maxHeight: 320, overflow: 'auto' }}>
          {filteredCountries.map((country) => {
            const countryName = en[country] || country;
            const callingCode = getCountryCallingCode(country);
            
            return (
              <ListItem
                key={country}
                button
                onClick={() => handleCountrySelect(country)}
                selected={country === selectedCountry}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#e7f5ff',
                    '&:hover': {
                      backgroundColor: '#d0ebff',
                    },
                  },
                }}
              >
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  <FlagImage iso2={country.toLowerCase()} style={{ width: '28px', height: '21px', borderRadius: '2px' }} />
                </Box>
                <ListItemText
                  primary={countryName}
                  secondary={`+${callingCode}`}
                  primaryTypographyProps={{
                    sx: { fontSize: '14px', fontWeight: 500, color: '#212529' }
                  }}
                  secondaryTypographyProps={{
                    sx: { fontSize: '12px', color: '#868e96' }
                  }}
                />
              </ListItem>
            );
          })}
          {filteredCountries.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center', color: '#868e96' }}>
              <Typography variant="body2">No countries found</Typography>
            </Box>
          )}
        </List>
      </Popover>
      
      {error && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            marginTop: '4px',
            color: '#fa5252',
            fontSize: '12px',
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default PhoneNumberInput;
