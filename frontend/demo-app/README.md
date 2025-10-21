# FastAPI Demo - Order Management Frontend

A modern React application for managing orders with real-time filtering and beautiful UI components.

## Features

- **Modern UI**: Built with Mantine and Material-UI components
- **Real-time Filtering**: Filter orders by date, service type, commodity, priority, and search text
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Grid**: Advanced data grid with sorting, pagination, and search
- **Type Safety**: Full TypeScript support with backend model matching
- **Dark Mode**: Toggle between light and dark themes

## Technologies Used

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Mantine** - Modern React components library
- **Material-UI** - Data grid and additional components
- **Vite** - Fast build tool and development server
- **dayjs** - Date manipulation library

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx           # Navigation bar with theme toggle
│   ├── OrderFilters.tsx     # Filter controls for orders
│   └── OrderGrid.tsx        # Data grid displaying orders
├── types/
│   └── order.ts            # TypeScript interfaces and enums
├── utils/
│   └── mockData.ts         # Mock data generation and filtering
├── App.tsx                 # Main application component
└── main.tsx               # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend/demo-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Features Overview

### Order Management
- View all orders in a comprehensive data grid
- Filter orders by ETA date (defaults to today)
- Filter by service type, commodity, and priority
- Search through order references, drivers, vehicles, and notes
- Real-time filtering with loading states

### UI Components
- **Navbar**: Brand logo, theme toggle, and navigation
- **Filters**: Date picker, dropdowns, search input, and priority toggle
- **Data Grid**: Sortable columns, pagination, row selection, and tooltips
- **Responsive Design**: Mobile-friendly layout and components

### Data Model
The frontend matches the backend Order model with support for:
- Order reference and service type
- ETA/ETD dates and times
- Commodity types and quantities (pallets, boxes, kilos)
- Driver and vehicle information
- Priority flags and notes

## Customization

### Theme
The application uses a custom blue theme that can be modified in `src/App.tsx`:

```typescript
const customBlue: MantineColorsTuple = [
  '#e7f5ff', // Light blue
  '#d0ebff',
  // ... more shades
  '#002f6c'  // Dark blue
];
```

### Adding New Filters
To add new filters:

1. Update the `OrderFilters` interface in `src/types/order.ts`
2. Add the filter component in `src/components/OrderFilters.tsx`
3. Update the `filterOrders` function in `src/utils/mockData.ts`

## Backend Integration

The frontend is designed to work with the FastAPI backend. To integrate:

1. Replace mock data with API calls
2. Update the `Order` interface to match backend responses
3. Add error handling and loading states
4. Implement CRUD operations

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Test components thoroughly
4. Update documentation as needed 