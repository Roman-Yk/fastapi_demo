# FastAPI Demo Frontend V2

A modern, scalable React application built with JavaScript (no TypeScript) featuring a component-driven architecture inspired by react-admin.

## 🏗️ Architecture

This application follows a modular, reusable component architecture designed for scalability:

### Component Structure

```
src/
├── components/
│   ├── data/           # Data display components
│   │   ├── FastaGrid.jsx      # Universal data grid (like react-admin's Datagrid)
│   │   └── DataGridToolbar.jsx # Grid toolbar with actions
│   ├── forms/          # Form field components
│   │   ├── FiltersWrapper.jsx  # Universal filter container (like react-admin's Filter)
│   │   ├── SearchField.jsx     # Reusable search input
│   │   ├── SelectField.jsx     # Enhanced select field
│   │   ├── SwitchField.jsx     # Switch/toggle field
│   │   └── ButtonGroupField.jsx # Button group selector
│   ├── layout/         # Layout components
│   │   └── Navbar.jsx
│   ├── routing/        # Routing configuration
│   │   └── AppRoutes.jsx
│   └── orders/         # Feature-specific components
│       ├── OrderFilters.jsx
│       └── OrderGrid.jsx
├── pages/              # Page components
├── constants/          # Application constants
├── utils/              # Utility functions
└── App.jsx
```

## 🎯 Key Features

### 1. FastaGrid Component
Universal data grid inspired by react-admin's Datagrid:
- Built-in toolbar with customizable actions
- Sorting, filtering, and pagination
- Empty state handling
- Responsive design
- Flexible column configuration

### 2. FiltersWrapper Component
Universal filter container inspired by react-admin's Filter:
- Collapsible filter sections
- Active filter badges with counts
- Clear all functionality
- Automatic filter detection
- Responsive layout

### 3. Reusable Form Fields
- `SearchField`: Enhanced search input with icon
- `SelectField`: Feature-rich select dropdown
- `SwitchField`: Toggle switch with labels
- `ButtonGroupField`: Button group for option selection

### 4. Modular Architecture
- **Separation of Concerns**: Each component has a single responsibility
- **Reusability**: Components can be used across different features
- **Scalability**: Easy to add new features and pages
- **Maintainability**: Clear structure and consistent patterns

## 🚀 Getting Started

1. Install dependencies:
```bash
cd frontend/demo-app-v2
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3001 in your browser

## 🔧 Component Usage Examples

### Using FastaGrid

```jsx
import { FastaGrid } from '../components/data';

const MyDataPage = () => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => <Badge>{params.value}</Badge>
    },
  ];

  return (
    <FastaGrid
      data={data}
      columns={columns}
      loading={loading}
      onRefresh={handleRefresh}
      onCreate={handleCreate}
      onEdit={handleEdit}
    />
  );
};
```

### Using FiltersWrapper

```jsx
import { FiltersWrapper, SearchField, SelectField } from '../components/forms';

const MyFilters = ({ filters, onFiltersChange }) => {
  return (
    <FiltersWrapper
      filters={filters}
      onFiltersChange={onFiltersChange}
      filterFields={[
        { name: 'search', label: 'Search' },
        { name: 'status', label: 'Status' },
      ]}
    >
      <Grid>
        <Grid.Col span={6}>
          <SelectField
            value={filters.status}
            onChange={(value) => onFiltersChange({ ...filters, status: value })}
            data={statusOptions}
          />
        </Grid.Col>
      </Grid>
    </FiltersWrapper>
  );
};
```

## 📦 Technology Stack

- **React 18** - Modern React with hooks
- **Mantine 7** - UI component library
- **Material-UI** - Data grid component
- **React Router 7** - Client-side routing
- **Vite** - Fast build tool
- **ESLint** - Code linting
- **PropTypes** - Runtime type checking

## 🎨 Design Principles

1. **Component Reusability**: Every component is designed to be reused across different contexts
2. **Prop-based Configuration**: Components are highly configurable through props
3. **Consistent API**: Similar components follow the same prop patterns
4. **Performance**: Optimized rendering with proper state management
5. **Accessibility**: Built-in accessibility features from Mantine
6. **Responsive**: Mobile-first responsive design

## 🔄 State Management

- **Local State**: React useState for component-specific state
- **Derived State**: useMemo for computed values
- **Props**: Data flow through component hierarchy
- **Future**: Ready for Redux/Zustand if global state needed

## 📈 Scalability Features

- **Modular Structure**: Easy to add new features
- **Consistent Patterns**: New developers can quickly understand the codebase
- **Reusable Components**: Reduce code duplication
- **Type Safety**: PropTypes provide runtime validation
- **Testing Ready**: Component structure facilitates unit testing

## 🧩 Adding New Features

1. **New Page**: Create in `src/pages/` and add to routing
2. **Feature Components**: Create in `src/components/[feature]/`
3. **Reusable Components**: Add to appropriate `src/components/` subfolder
4. **Constants**: Add to `src/constants/`
5. **Utilities**: Add to `src/utils/`

This architecture ensures that the application can grow while maintaining clean, maintainable code.
