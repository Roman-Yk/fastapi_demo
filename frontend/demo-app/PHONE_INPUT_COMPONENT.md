# Phone Number Input Component

## Overview
A beautiful, internationalized phone number input component with country flag selection, built using:
- `react-phone-number-input` - For phone number handling and formatting
- `@mui/material` - For Material-UI styling
- `@emotion/react` & `@emotion/styled` - For styled components

## Features
✅ **International Support** - Supports phone numbers from all countries  
✅ **Beautiful Custom Dropdown** - Material-UI styled dropdown menu with smooth animations  
✅ **Search Functionality** - Quickly find countries by typing in the search box  
✅ **SVG Flag Icons** - High-quality SVG flag images for each country  
✅ **Flag Inside Input** - Country flag is positioned inside the input field for a cleaner look  
✅ **Auto Country Code** - Automatically adds country calling code when selecting a country  
✅ **Country Calling Codes** - Shows calling codes for each country in the dropdown  
✅ **Max Length Validation** - Enforces maximum length based on selected country  
✅ **Auto-formatting** - Automatically formats phone numbers as you type  
✅ **Validation** - Built-in phone number validation  
✅ **Smart Country Detection** - Automatically detects and updates country from phone number  
✅ **Beautiful Design** - Clean, modern UI with Material-UI styling  
✅ **Accessibility** - Fully accessible with keyboard navigation  
✅ **Customizable** - Support for labels, placeholders, required fields, and error messages  
✅ **TypeScript** - Full TypeScript support with type safety  

## Installation

The following packages have been installed:

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install react-phone-number-input
npm install react-international-phone
```

## Component Location

```
/frontend/demo-app/src/components/admin/forms/PhoneInput.tsx
```

## Usage

### Basic Usage

```tsx
import { PhoneNumberInput } from '../../components/admin/forms';

const [phone, setPhone] = useState<string>('');

<PhoneNumberInput
  label="Phone Number"
  placeholder="Enter your phone number"
  value={phone}
  onChange={(value) => setPhone(value || '')}
  defaultCountry="NO"
/>
```

### With Required Field

```tsx
<PhoneNumberInput
  label="Phone Number"
  placeholder="Enter your phone number"
  value={phone}
  onChange={(value) => setPhone(value || '')}
  defaultCountry="NO"
  required
/>
```

### With Error Message

```tsx
<PhoneNumberInput
  label="Phone Number"
  placeholder="Enter your phone number"
  value={phone}
  onChange={(value) => setPhone(value || '')}
  defaultCountry="NO"
  required
  error="Phone number is required"
/>
```

### Different Country Default

```tsx
<PhoneNumberInput
  label="US Phone Number"
  placeholder="Enter US phone number"
  value={phone}
  onChange={(value) => setPhone(value || '')}
  defaultCountry="US"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text for the input |
| `placeholder` | `string` | `'Enter phone number'` | Placeholder text |
| `value` | `string` | - | Current phone number value |
| `onChange` | `(value: string \| undefined) => void` | - | Callback when value changes |
| `required` | `boolean` | `false` | Show required indicator (*) |
| `defaultCountry` | `string` | `'NO'` | Default country code (ISO 3166-1 alpha-2) |
| `disabled` | `boolean` | `false` | Disable the input |
| `error` | `string` | - | Error message to display |

## Implementation in EditOrderPage

The component has been integrated into the EditOrderPage for both:
- **ETA-A driver phone** - Arrival driver phone number
- **ETD-D driver phone** - Departure driver phone number

### Before
```tsx
<TextField
  label="ETA-A driver phone"
  placeholder="+47"
  value={formData.eta_driver_phone || ''}
  onChange={(value) => setForm(prev => ({ 
    ...prev, 
    eta_driver_phone: value
  }))}
/>
```

### After
```tsx
<PhoneNumberInput
  label="ETA-A driver phone"
  placeholder="+47 XXX XX XXX"
  value={formData.eta_driver_phone || ''}
  onChange={(value) => setForm(prev => ({ 
    ...prev, 
    eta_driver_phone: value || null
  }))}
  defaultCountry="NO"
/>
```

## Examples

A comprehensive example page has been created at:
```
/frontend/demo-app/src/examples/PhoneInputExample.tsx
```

This example demonstrates:
- Basic phone input
- Phone input with initial value
- Required phone input
- Different country defaults
- All available features

## Styling

The component includes:
- **Custom Material-UI Dropdown** - Beautiful dropdown with smooth popover animations
- **Search Box** - Integrated search field to quickly find countries
- **High-Quality SVG Flags** - Crisp, scalable flag images for all countries
- **Country Information** - Displays country name and calling code
- **Flag Inside Input** - Country flag is positioned inside the input field on the left
- **Hover Effects** - Smooth hover states on dropdown items
- **Selected State** - Visual indicator for currently selected country
- **Clean borders** - Subtle gray borders with rounded corners
- **Focus states** - Blue border and shadow on focus
- **Responsive design** - Works on all screen sizes
- **Consistent theming** - Matches the rest of the application
- **Smooth transitions** - All interactions have smooth CSS transitions
- **No Rendering Issues** - Custom Material-UI popover prevents any rendering issues

## Country Code Format

The component returns phone numbers in **E.164 format** (e.g., `+4791234567`), which is the international standard for phone numbers.

## Browser Support

Works in all modern browsers that support ES6+ and React 18+.

## Notes

- The component automatically validates phone numbers based on the selected country
- Phone numbers are formatted in real-time as the user types
- The country dropdown includes search functionality for easy country selection
- The component handles both controlled and uncontrolled inputs
